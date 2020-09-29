import config from '../config/config'
import { Sachet } from '../entity/Sachet'
import { ImageService } from './ImageService'

const nodemailer = require('nodemailer')

export class EmailService {
  static sendMail(toEmail: string, subject: string, body: string, logo?: Buffer): Promise<object> {
    const transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    })

    let attachments = [];

    if (logo) {
      attachments =  [{
        content: logo,
        cid: 'logo',
        filename: 'logo.jpg'
      }];
    }

    return transporter.sendMail({
      to: toEmail,
      subject: subject,
      html: body,
      attachments: attachments
    })
  }

  static sendNewSachetCreatedEmail(sachet: Sachet) {
    const subject = 'GEL + FRANCE - Nouveau sachet créé'

    const linkUrl = `${config.host}/?uxv&id=${sachet.id}`;

    const body = `<div>
        <p>Bonjour,</p>
        <p>Un nouveau sachet a été créé: <a href="${linkUrl}">${linkUrl}</a>
        <br/>Email: <a href="mailto:${sachet.email}">${sachet.email}</a>
        </p>
        <p></p>
        <p>Cordialement</p>
        </div>`;

    return EmailService.sendMail(config.emailTo, subject, body);
  }

  static async sendNewSachetCreatedEmailClient(sachet: Sachet, contentEmail?: string) {
    const subject = 'GEL + FRANCE - Nouveau sachet créé'

    const linkUrl = `${config.host}/?id=${sachet.id}`;
    const linkHtml = `<a href="${linkUrl}">${linkUrl}</a>`;
    const buyUrl = 'https://www.gelplusfrance.com/product-page/sachet-personnalisable'

    let body = `<div>
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint le visuel 3D du sachet crée référence <b>${sachet.id}</b> : <a href="${linkUrl}">${linkUrl}</a>
        <br/>Pour commander, cliquer sur ce lien : <a href="${buyUrl}">${buyUrl}</a>
        </p>
        <p></p>
        <p>Bien Cordialement<br><a href="https://www.gelplusfrance.com/">https://www.gelplusfrance.com/</a></p>
        </div>`;

    let logo;

    if (contentEmail) {
      const styleTag = `<style>.sachet-container { position:relative } 
      .sachet-container .img-sachet {width: 200px;} 
      .sachet-container .img-logo {position: absolute;left: 31px;top: 72px;width: 138px;}</style>`

      const imageTag = `${styleTag}<div class="sachet-container" style="position:relative"><img src="cid:logo" class="img-logo" style="position: absolute;left: 31px;top: 72px;width: 138px;" /></div>`

      body = contentEmail
        .replace(/{ID_SACHET}/g, sachet.id.toString())
        .replace(/{SACHET_LINK}/g, linkHtml)
        .replace(/{SACHET_IMAGE}/g, imageTag)

      logo = await ImageService.createSachetImage(sachet.logo)
    }

    return EmailService.sendMail(sachet.email, subject, body, logo);
  }
}