const nodemailer = require('nodemailer');
const config = require('../../config.json');

module.exports = (publicKey, privateKey, passphrase, email) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(config.mail.smtp);
    console.log(publicKey)
    const mailOptions = {
      from: `"Администратор EDMS" <ascold96@gmail.com>`,
      to: email,
      subject: 'Ваша цифровая подпись EDMS',
      text: `Ваши ключи цифровой подписи\nПарольная фраза для приватного ключа: ${passphrase}\nНе говорите их никому!`,
      attachments: [
        {
          filename: publicKey.name,
          content: new Buffer(publicKey.content,'utf-8')
        },
        {
          filename: privateKey.name,
          content: new Buffer(privateKey.content,'utf-8')
        }
      ]
    };
    //отправляем почту
    transporter.sendMail(mailOptions)
      .then(() => resolve({ result: true }))
      .catch(e => reject({ error: 'Произошла ошибка при отправке!' }));
  })
}