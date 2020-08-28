import config from "../config/config";
const nodemailer = require('nodemailer');

export class EmailService {
  static sendMail(toEmail: string, subject: string, body: string): Promise<object> {
    const transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });

    return transporter.sendMail({
      to: toEmail, // list of receivers
      subject: subject, // Subject line
      html: body, // html body
    });
  }
}