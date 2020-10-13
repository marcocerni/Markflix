import config from '../config/config'
import { Sachet } from '../entity/Sachet'
import { ImageService } from './ImageService'
import * as nodemailer from 'nodemailer'
import * as sendinBlue from 'nodemailer-sendinblue-transport'

export class EmailService {
  private transporter: any

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  sendMail(toEmail: string, subject: string, body: string, logo?: Buffer): Promise<object> {

    let attachments = []

    if (logo) {
      attachments = [{
        content: logo,
        cid: 'logo',
        filename: 'logo.jpg',
      }]
    }

    return this.transporter.sendMail({
      from: config.email.fromUser,
      to: toEmail,
      subject: subject,
      html: body,
      attachments: attachments,
    })
  }

  sendNewSachetCreatedEmail(sachet: Sachet) {
    const subject = 'GEL + FRANCE - Nouveau sachet créé'

    const linkUrl = `${sachet.link}&uxv`

    const body = `<div>
        <p>Bonjour,</p>
        <p>Un nouveau sachet a été créé: <a href="${linkUrl}">${linkUrl}</a>
        <br/>Email: <a href="mailto:${sachet.email}">${sachet.email}</a>
        </p>
        <p></p>
        <p>Cordialement</p>
        </div>`

    return this.sendMail(config.emailTo, subject, body)
  }

  async sendNewSachetCreatedEmailClient(sachet: Sachet, contentEmail?: string, subject = 'GEL + FRANCE - Nouveau sachet créé') {

    const linkHtml = `<a href="${sachet.link}">${sachet.link}</a>`
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

    return this.sendMail(sachet.email, subject, body, logo)
  }
}