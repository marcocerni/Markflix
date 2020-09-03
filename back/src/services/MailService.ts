import config from '../config/config'
import { Sachet } from '../entity/Sachet'

const nodemailer = require('nodemailer')

export class EmailService {
  static sendMail(toEmail: string, subject: string, body: string): Promise<object> {
    const transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    })

    return transporter.sendMail({
      to: toEmail, // list of receivers
      subject: subject, // Subject line
      html: body, // html body
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

  static sendNewSachetCreatedEmailClient(sachet: Sachet) {
    const subject = 'GEL + FRANCE - Nouveau sachet créé'

    const linkUrl = `${config.host}/?id=${sachet.id}`;
    const buyUrl = 'https://www.gelplusfrance.com/product-page/sachet-personnalisable'

    const body = `<div>
        <p>Bonjour,</p>
        <p>Vous venez de créer le sachet #<b><a href="${linkUrl}">${sachet.id}</a></b>
        <br/>Pour commander s'il vous plait clickez sur: <a href="${buyUrl}">${buyUrl}</a>
        </p>
        <p></p>
        <p>Cordialement<br>GEL + FRANCE</p>
        </div>`;

    return EmailService.sendMail(sachet.email, subject, body);
  }
}