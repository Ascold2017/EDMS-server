const nodemailer = require('nodemailer');
const config = require('../../config.json');

module.exports = (userName, userLogin, publicKey, privateKey, passphrase, email) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const adress = 'http://localhost:3000'
    const mailOptions = {
      from: `"Администратор EDMS" <ascold96@gmail.com>`,
      to: email,
      subject: 'Ваши авторизационные данные EDMS',
      text: `Здравствуйте, ${userName}!\n
      Администрация EDMS уведомляет вас, что вы успешно зарегистрированы в системе!\n
      Чтобы войти в учетную запись - вам необходимо перейти по адресу: ${adress} и авторизоваться с помощью вашего логина, парольной фразы и приватного ключа\n
      Ваш логин - ${userLogin}\n
      Ваша арольная фраза для приватного ключа: ${passphrase}\n
      Ваш приватный ключ - ${privateKey.name}\n
      Ваш публичный ключ - ${publicKey.name}\n
      Обратите внимание - ключи сгенерированы автоматически, они нигде не хранятся, и их не могут знать даже сотрудники EDMS.\n
      Не выдавайте данные приватного ключа и парольной фразы НИКОМУ!\n`,
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