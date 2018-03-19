const nodemailer = require('nodemailer');
const config = require('../../config.json');

module.exports = (adress, userName, userLogin, publicKey, privateKey, passphrase, email) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
      from: `"Администратор EDMS" <ascold96@gmail.com>`,
      to: email,
      subject: 'Ваши авторизационные данные EDMS',
      html: `<h3>Здравствуйте, ${userName}!</h3>
      <p>Администрация EDMS уведомляет вас, что вы успешно зарегистрированы в системе! </p>
      <p>Чтобы войти в учетную запись - вам необходимо перейти по адресу: <a href=${adress}>${adress}</a> и авторизоваться с помощью вашего логина, парольной фразы и приватного ключа</p>
      <p>Ваш логин - <b>${userLogin}</b></p>
      <p>Ваша парольная фраза для приватного ключа: <b>${passphrase}</b></p>
      <p>Ваш приватный ключ - <b>${privateKey.name}</b></p>
      <p>Ваш публичный ключ - <b>${publicKey.name}</b></p>
      <p>Обратите внимание - ключи сгенерированы автоматически, они нигде не хранятся, и их не могут знать даже сотрудники EDMS.</p>
      <p>Не выдавайте данные приватного ключа и парольной фразы НИКОМУ!</p>`,
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