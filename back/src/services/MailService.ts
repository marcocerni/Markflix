import config from '../config/config'
import { Sachet } from '../entity/Sachet'
import { ImageService } from './ImageService'
import * as nodemailer from 'nodemailer'
import { getRepository } from 'typeorm'
import { UnsubscribedEmail } from '../entity/UnsubscribedEmail'

export class EmailService {
  private transporter: any
  private transporterMassive: any
  private unsubscribedEmails: string[]

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    })

    this.transporterMassive = nodemailer.createTransport({
      service: config.emailMassive.service,
      auth: {
        user: config.emailMassive.user,
        pass: config.emailMassive.password,
      },
    })

    this.unsubscribedEmails = []
  }

  async init() {
    const emailRepository = getRepository(UnsubscribedEmail)

    this.unsubscribedEmails = (await emailRepository.find()).map(unsubscribedEmail => unsubscribedEmail.email.toLowerCase())
  }

  async sendMail(toEmail: string, subject: string, body: string, logo?: Buffer, massive = true): Promise<object> {

    if (this.unsubscribedEmails.includes(toEmail.toLowerCase())) {
      throw new Error(`Email unsubscribed: ${toEmail}`)
    }

    try {
      const sachetRepository = getRepository(Sachet)

      const sachet = await sachetRepository.findOne({where: {email: toEmail}});

      if (massive && sachet) {
        throw new Error(`Email already in the database: ${toEmail}`)
      }
    } catch (e) {

    }

    let attachments = []

    if (logo) {
      attachments = [{
        content: logo,
        cid: 'logo',
        filename: 'logo.jpg',
      }]
    }

    const transporter = massive ? this.transporterMassive : this.transporter

    return transporter.sendMail({
      from: massive ? config.emailMassive.fromUser : config.email.fromUser,
      to: toEmail,
      subject: subject,
      html: body,
      attachments: attachments,
    })
  }

  async sendNewSachetCreatedEmail(sachet: Sachet, massive = true) {
    const subject = 'GEL + FRANCE - Nouveau sachet créé'

    const linkHtml = `<table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 3px;" bgcolor="#205685"><a href="${sachet.link}&uxv" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; text-decoration: none;border-radius: 3px; padding: 12px 18px; border: 1px solid #205685; display: inline-block;">Visualisation en 3D</a></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`

    const body = `<div>
        <p>Bonjour,</p>
        <p>Un nouveau sachet a été créé: <br/> ${linkHtml}
        <br/>Email: <a href="mailto:${sachet.email}">${sachet.email}</a>
        </p>
        <p></p>
        <p>Cordialement</p>
        </div>`

    return this.sendMail(config.emailTo, subject, body, undefined, massive)
  }

  async sendNewSachetCreatedEmailClient(sachet: Sachet, contentEmail?: string, subject = 'GEL + FRANCE - Nouveau sachet créé', massive = true) {

    const linkHtml = `<table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 3px;" bgcolor="#205685"><a href="${sachet.link}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; text-decoration: none;border-radius: 3px; padding: 12px 18px; border: 1px solid #205685; display: inline-block;">Visualisation en 3D</a></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    // const linkHtml = `<a href="${sachet.link}">${sachet.link}</a>`
    const buyUrl = 'https://www.gelplusfrance.com/product-page/sachet-personnalisable'

    let body = `<div>
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint le visuel 3D du sachet crée référence <b>${sachet.id}</b> : <br/> ${linkHtml}
        <br/>Pour commander, cliquer sur ce lien : <a href="${buyUrl}">${buyUrl}</a>
        </p>
        <p></p>
        <p>Bien Cordialement<br><a href="https://www.gelplusfrance.com/">https://www.gelplusfrance.com/</a></p>
        </div>`

    let logo

    if (contentEmail) {
      const styleTag = `<style>.sachet-container { } 
      .sachet-container .img-sachet {width: 100px;} 
      .sachet-container .img-logo {width: 100px;}</style>`

      const imageTag = `${styleTag}<div class="sachet-container"><img src="cid:logo" class="img-logo" 
            style="width: 100px;margin: 0;border: 0;padding: 0;display: block;" width="100" /></div>`

      body = contentEmail
        .replace(/{ID_SACHET}/g, sachet.id.toString())
        .replace(/{SACHET_LINK}/g, linkHtml)
        .replace(/{SACHET_IMAGE}/g, imageTag)

      logo = await ImageService.createSachetImage(sachet.logo)
    }

    const unsubscribeLink = `${config.host}/unsubscribe.html?id=${sachet.hashedId}`

    body += `<div style="text-align: center; color: #333333;"><a href="${unsubscribeLink}">Se désinscrire</a></div>`

    return this.sendMail(sachet.email, subject, body, logo, massive)
  }
}