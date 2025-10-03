import nodemailer from "nodemailer";
import winston from "winston";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const sendMail = async (
  from: string,
  to: string,
  subject: string,
  html: string
) => {

    const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    service: process.env.SMTP_SERVICE || 'Gmail', // Use 'gmail' or your SMTP service
   auth: {
      user: process.env.MAIL,
      pass: process.env.MAIL_PASSWORD,
    },
  });


  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: html,
  };

  logger.info(`Sending mail to - ${to}`);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info("Email sent: " + info.response);
    }
  });
};
