const nodemailer = require('nodemailer')
const config = require('../../config.json')

module.exports = ({ group, adress, email, login, password, subject }) => {
  //инициализируем модуль для отправки писем и указываем данные из конфига
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(config.mail.smtp)
    const mailOptions = {
      from: `"Адміністратор EDMS" <ascold96@gmail.com>`,
      to: email,
      subject,
      html: `<h3>Здрастуйте!</h3>
      <p>Адміністрація EDMS повідомляє вас, що ви отримали доступ адміністратора в групі <b>${group}</b></p>
      <p>Для авторизації перейдіть за адресою: <a href=${adress}>${adress}</a></b></p>
      <p>Ваш логін EDMS: <b>${login}</b></p>
      <p>Ваш пароль для входу: <b>${password}</b></p>
      <p><b>Не кажіть їх нікому!</b></p>`,
    }
    //отправляем почту
    transporter.sendMail(mailOptions)
    .then(() => resolve({result: true}))
    .catch(e => reject({ error: 'Виникла помилка при відправці!' }))
  })
} 