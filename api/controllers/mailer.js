const nodemailer = require('nodemailer');
const config = require('../../config.json');

module.exports = ({ group, adress, email, login, password, subject }) => {
  //инициализируем модуль для отправки писем и указываем данные из конфига
  return new Promise((resolve, reject) => {
    console.log(email, login, password);
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
      from: `"Администратор EDMS" <ascold96@gmail.com>`,
      to: email,
      subject,
      html: `<h3>Здравствуйте!</h3>
      <p>Администрация EDMS уведомляет вас, что вы получили доступ администратора в группе <b>${group}</b></p>
      <p>Для авторизации перейдите по адресу: <a href=${adress}>${adress}</a></b></p>
      <p>Ваш логин EDMS: <b>${login}</b></p>
      <p>Ваш пароль для входа: <b>${password}</b></p>
      <p><b>Не говорите их никому!</b></p>`,
    };
    //отправляем почту
    transporter.sendMail(mailOptions)
    .then(() => resolve({result: true}))
    .catch(e => reject({ error: 'Произошла ошибка при отправке!' }));
  })
} 