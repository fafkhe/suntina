const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secureConnection: false,
  tls: {
    ciphers: 'SSLv3',
  },
  secure: false,
  auth: {
    user: 'fatemeh.khorshidvand1@gmail.com',
    pass: 'peivydxksbsmaxzi',
  },
});
export async function sendEmail(email: string, code: string) {
  const info = await transporter.sendMail({
    from: 'fatemeh.khorshidvand1@gmail.com',
    to: email,
    subject: 'VERIFICATION CODE',
    html: `<b>Here is your verification code: ${code}</b>`,
  });
  console.log('Message sent: %s', info.messageId);
}
