import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import { validate, ValidationError } from 'class-validator'
import { Sachet } from '../entity/Sachet'
import { ImageService } from '../services/ImageService'
import { EmailService } from '../services/MailService'
import config from '../config/config'
import * as https from 'https'
import { UnsubscribedEmail } from '../entity/UnsubscribedEmail'
import { UnsubscribedDomain } from '../entity/UnsubscribedDomain'

const Hashids = require('hashids/cjs')
const validUrl = require('valid-url')

const hashids = new Hashids(config.hashSalt, 10)

// const hashids = new Hashids(config.hashSalt)

class SachetController {

  static listAll = async (req: Request, res: Response) => {
    const sachetRepository = getRepository(Sachet)
    const sachets = await sachetRepository.find({
      select: [
        'id',
        'email',
        'createdAt',
        // 'opacity',
        // 'backBackground',
        // 'backBackgroundColor',
        // 'backBackgroundOpacity',
        // 'backColor',
        // 'frontBackground',
        // 'frontBackgroundColor',
        // 'frontBackgroundOpacity',
        // 'frontColor',
        // 'logo',
      ],
    })

    sachets.forEach(sachet => {
      sachet.hashedId = hashids.encode(sachet.id)
      sachet.link = `${config.host}/?id=${sachet.hashedId}`
    })

    res.send(sachets)
  }

  static getUnsubscribedEmails = async (req: Request, res: Response) => {
    const sachetRepository = getRepository(UnsubscribedEmail)
    const unsubscribedEmails = await sachetRepository.find({
      select: [
        'email',
        'createdAt',
      ],
    })

    res.send(unsubscribedEmails)
  }

  static getUnsubscribedDomains = async (req: Request, res: Response) => {
    const domainRepository = getRepository(UnsubscribedDomain)
    const unsubscribedDomains = await domainRepository.find({
      select: [
        'domain',
        'createdAt',
      ],
    })

    res.send(unsubscribedDomains)
  }

  static getOneById = async (req: Request, res: Response) => {
    const id = hashids.decode(req.params.id)[0] as number

    if (!id) {
      return res.status(404).send('Sachet not found')
    }

    const sachetRepository = getRepository(Sachet)
    try {
      const sachet = await sachetRepository.findOneOrFail(id, {
        select: [
          'id',
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

      sachet.hashedId = hashids.encode(sachet.id)
      sachet.link = `${config.host}/?id=${sachet.hashedId}`

      res.send(sachet)
    } catch (error) {
      res.status(404).send('Sachet not found')
    }
  }

  static getLogo = async (req: Request, res: Response) => {
    const id = hashids.decode(req.params.id)[0] as number

    const sachetRepository = getRepository(Sachet)
    try {
      const sachet = await sachetRepository.findOneOrFail(id)

      if (validUrl.isUri(sachet.logo)) {

        https.get(sachet.logo, (resImage) => {
          res.status(resImage.statusCode)
          res.setHeader('Content-Type', resImage.headers['content-type'])
          resImage.pipe(res)
        }).on('error', (error) => {
          console.error(error)
        })
      } else {
        res.send(sachet.logo)
      }
    } catch (error) {
      console.error(error)
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

      sachet.hashedId = hashids.encode(sachet.id)
      sachet.link = `${config.host}/?id=${sachet.hashedId}`
    } catch (e) {
      return res.status(409).send('id already in use')
    }

    const emailService = new EmailService()

    await emailService.init()

    await Promise.all([
      emailService.sendNewSachetCreatedEmail(sachet, false),
      emailService.sendNewSachetCreatedEmailClient(sachet, undefined, undefined, false),
    ])

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
    const id = hashids.decode(req.params.id)[0] as number

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

      sachet.hashedId = hashids.encode(sachet.id)
      sachet.link = `${config.host}/?id=${sachet.hashedId}`
    } catch (e) {
      return res.status(409).send('id already in use')
    }

    res.status(200).send(sachet)
  }

  static deleteSachet = async (req: Request, res: Response) => {
    const id = hashids.decode(req.params.id)[0] as number

    const sachetRepository = getRepository(Sachet)
    try {
      await sachetRepository.findOneOrFail(id)
      await sachetRepository.delete(id)

      res.status(204).send()
    } catch (error) {
      return res.status(404).send('Sachet not found')
    }
  }

  static unsubscribeSachet = async (req: Request, res: Response) => {
    const id = hashids.decode(req.params.id)[0] as number

    const sachetRepository = getRepository(Sachet)
    let sachet
    try {
      sachet = await sachetRepository.findOneOrFail(id)
    } catch (error) {
      return res.status(404).send('Sachet not found')
    }

    try {
      const unsubscribedEmail = new UnsubscribedEmail(sachet.email)

      const emailRepository = getRepository(UnsubscribedEmail)

      await emailRepository.save(unsubscribedEmail)
    } catch (error) {
      return res.status(404).send('Email not unsubscribed')
    }

    return res.status(200).send('Email désabonné')
  }

  static unsubscribeEmails = async (req: Request, res: Response) => {
    const { emails } = req.body

    if (!emails || !emails.length) {
      return res.status(400).send('Not emails')
    }

    const emailRepository = getRepository(UnsubscribedEmail)

    try {
      const savedEmails = await Promise.all(emails.map(async email => {
        const alreadyCreated = await emailRepository.findOne({email: email});
        if (alreadyCreated) return alreadyCreated;

        const unsubscribedEmail = new UnsubscribedEmail(email)

        return emailRepository.save(unsubscribedEmail)
      }))

      return res.status(200).send(savedEmails)
    } catch (error) {
      console.log(error)
      return res.status(404).send('Email not unsubscribed')
    }
  }

  static unsubscribeDomains = async (req: Request, res: Response) => {
    const { domains } = req.body

    if (!domains || !domains.length) {
      return res.status(400).send('Not domains')
    }

    const domainRepository = getRepository(UnsubscribedDomain)

    try {
      const savedDomains = await Promise.all(domains.map(async domain => {
        const alreadyCreated = await domainRepository.findOne({domain: domain})
        if (alreadyCreated) return alreadyCreated

        const unsubscribedDomain = new UnsubscribedDomain(domain)

        return domainRepository.save(unsubscribedDomain)
      }))

      return res.status(200).send(savedDomains)
    } catch (error) {
      console.log(error)
      return res.status(404).send('Domains not unsubscribed')
    }
  }

  static massiveSend = async (req: Request, res: Response) => {
    const { content, csv, sendEmails, provider, avoidDuplicates } = req.body

    const lineErrors = []

    const sachets = await Promise.all(csv.map(async (line, index) => {
      const [email, url, logo] = line

      if (logo) {
        const sachet = new Sachet()

        sachet.logo = logo
        sachet.email = email.trim()

        const errors = await validate(sachet)
        if (errors.length > 0) {
          lineErrors.push({
            i: (index + 1),
            errors: errors.map((error: ValidationError) => error.toString()).join(', '),
          })
        }

        const sachetRepository = getRepository(Sachet)
        try {
          await sachetRepository.save(sachet)

          sachet.hashedId = hashids.encode(sachet.id)
          sachet.link = `${config.host}/?id=${sachet.hashedId}`
        } catch (e) {
          return res.status(409).send(e.message)
        }

        return sachet
      } else {
        const sachet = new Sachet()
        sachet.email = email.trim()
        sachet.link = config.host

        return sachet
      }
    }))

    if (sendEmails === 'true') {
      console.time('Sending emails')

      const emailService = new EmailService(provider, avoidDuplicates === 'true')
      await emailService.init()

      await Promise.all(sachets.map((sachet: Sachet, index) => {
        return emailService.sendNewSachetCreatedEmailClient(sachet, content, `Votre sachet de gel hydroalcoolique monodose personnalisé`)
          .catch((error) => {
            lineErrors.push({
              i: (index + 1),
              errors: error.message,
            })
          })
      }))

      console.timeEnd('Sending emails')
    }

    res
      .status(200)
      .send({ errors: lineErrors, sachets: sachets })
  }
}

export default SachetController
