const nodemailer = require('nodemailer')
const config = require('../../config.json')

module.exports = (adress, userName, userLogin, publicKey, privateKey, passphrase, email) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(config.mail.smtp)
    const mailOptions = {
      from: `"Адміністратор EDMS" <ascold96@gmail.com>`,
      to: email,
      subject: 'Ваші авторизаційні дані EDMS',
      html: `<h3>Здрастуйте, ${userName}!</h3>
      <p>Адміністрация EDMS повідомляє вас, що ви успішно зареєстровані в системі! </p>
      <p>Щоб увійти в аккаунт - вам необхідно перейти за адресою: <a href=${adress}>${adress}</a> і авторизуватись за допомогою вашого логіна, парольної фразы та приватного ключа</p>
      <p>Ваш логін - <b>${userLogin}</b></p>
      <p>Ваша парольна фраза для приватного ключа: <b>${passphrase}</b></p>
      <p>Ваш приватный ключ - <b>${privateKey.name}</b></p>
      <p>Ваш публічный ключ - <b>${publicKey.name}</b></p>
      <p>Зверніть увагу - ключі сгенеровані автоматично, вони ніде не зберігаються, та їх не можуть знати навіть співробітники EDMS.</p>
      <p>Не видавайте дані приватного ключа та парольної фрази НІКОМУ!</p>`,
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
    }
    //отправляем почту
    transporter.sendMail(mailOptions)
      .then(() => resolve({ result: true }))
      .catch(e => reject({ error: 'Виникла помилка при відправці!' }))
  })
}