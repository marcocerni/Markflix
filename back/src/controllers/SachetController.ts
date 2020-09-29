import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import { validate } from 'class-validator'
import { Sachet } from '../entity/Sachet'
import { ImageService } from '../services/ImageService'
import { EmailService } from '../services/MailService'
import config from '../config/config'

class SachetController {

  static listAll = async (req: Request, res: Response) => {
    const sachetRepository = getRepository(Sachet)
    const sachets = await sachetRepository.find({
      select: [
        'logo',
        'opacity',
        'backBackground',
        'backBackgroundColor',
        'backBackgroundOpacity',
        'backColor',
        'frontBackground',
        'frontBackgroundColor',
        'frontBackgroundOpacity',
        'frontColor',
        'email',
      ],
    })

    res.send(sachets)
  }

  static getOneById = async (req: Request, res: Response) => {
    const id: string = req.params.id

    const sachetRepository = getRepository(Sachet)
    try {
      const sachet = await sachetRepository.findOneOrFail(id, {
        select: [
          'logo',
          'opacity',
          'backBackground',
          'backBackgroundColor',
          'backBackgroundOpacity',
          'backColor',
          'frontBackground',
          'frontBackgroundColor',
          'frontBackgroundOpacity',
          'frontColor',
          'email',
        ],
      })
      res.send(sachet)
    } catch (error) {
      res.status(404).send('Sachet not found')
    }
  }

  static newSachet = async (req: Request, res: Response) => {
    const sachet = new Sachet()

    await SachetController.mapRequestToSachet(req, sachet)

    const errors = await validate(sachet)
    if (errors.length > 0) {
      return res.status(400).send(errors)
    }

    const sachetRepository = getRepository(Sachet)
    try {
      await sachetRepository.save(sachet)
    } catch (e) {
      return res.status(409).send('id already in use')
    }

    const result = await EmailService.sendNewSachetCreatedEmail(sachet)
    const result2 = await EmailService.sendNewSachetCreatedEmailClient(sachet)

    res.status(200).send(sachet)
  }

  static mapRequestToSachet(req: Request, sachet: Sachet) {
    sachet.opacity = req.body['sides-opacity'] ? req.body['sides-opacity'] : 50
    sachet.backBackgroundColor = req.body['back-color']
    sachet.backBackgroundOpacity = req.body['back-opacity']
    sachet.backColor = req.body['back-font-color']
    sachet.frontBackgroundColor = req.body['face-color']
    sachet.frontBackgroundOpacity = req.body['face-opacity']
    sachet.frontColor = req.body['face-font-color']
    sachet.email = req.body['email']

    return Promise.all((req.files as any).map(async (file) => {
      if (file.fieldname === 'logo-file') {
        if (sachet.logo) {
          ImageService.deleteImage(sachet.logo)
        }

        sachet.logo = await ImageService.uploadImage(file)
      } else if (file.fieldname === 'face-file') {
        if (sachet.frontBackground) {
          ImageService.deleteImage(sachet.frontBackground)
        }

        sachet.frontBackground = await ImageService.uploadImage(file)
      } else if (file.fieldname === 'back-file') {
        if (sachet.backBackground) {
          ImageService.deleteImage(sachet.backBackground)
        }

        sachet.backBackground = await ImageService.uploadImage(file)
      } else {
        return
      }
    }))
  }

  static editSachet = async (req: Request, res: Response) => {
    const id = req.params.id

    const sachetRepository = getRepository(Sachet)
    let sachet
    try {
      sachet = await sachetRepository.findOneOrFail(id)
    } catch (error) {
      return res.status(404).send('Sachet not found')
    }

    await SachetController.mapRequestToSachet(req, sachet)

    const errors = await validate(sachet)
    if (errors.length > 0) {
      return res.status(400).send(errors)
    }

    try {
      await sachetRepository.save(sachet)
    } catch (e) {
      return res.status(409).send('id already in use')
    }

    res.status(200).send(sachet)
  }

  static deleteSachet = async (req: Request, res: Response) => {
    const id = req.params.id

    const sachetRepository = getRepository(Sachet)
    try {
      await sachetRepository.findOneOrFail(id)
      await sachetRepository.delete(id)

      res.status(204).send()
    } catch (error) {
      return res.status(404).send('Sachet not found')
    }
  }

  static massiveSend = async (req: Request, res: Response) => {
    const { content, csv, sendEmails = false } = req.body

    const lineErrors = []

    const sachets = await Promise.all(csv.map(async (line, index) => {
      const sachet = new Sachet()

      sachet.logo = line[2]
      sachet.email = line[0]
      sachet.opacity = 50
      sachet.backBackgroundColor = '#ffffff'
      sachet.backBackgroundOpacity = 100
      sachet.backColor = '#000000'
      sachet.frontBackgroundColor = '#ffffff'
      sachet.frontBackgroundOpacity = 100
      sachet.frontColor = '#000000'

      const errors = await validate(sachet)
      if (errors.length > 0) {
        lineErrors.push({
          i: index,
          errors: errors,
        })
      }

      const sachetRepository = getRepository(Sachet)
      try {
        await sachetRepository.save(sachet)

        sachet.link = `${config.host}/?id=${sachet.id}`
      } catch (e) {
        return res.status(409).send(e.message)
      }

      if (sendEmails)
        await EmailService.sendNewSachetCreatedEmailClient(sachet, content)

      return sachet;
    }))

    res.status(200).send({errors: lineErrors, sachets: sachets})
  }
}

export default SachetController
