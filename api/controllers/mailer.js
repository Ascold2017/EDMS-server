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
      text: `Здравствуйте!\n
      Администрация EDMS уведомляет вас, что вы получили доступ администратора в группе ${group}\n
      Для авторизации перейдите по адресу: ${adress}\n
      Ваш логин EDMS: ${login} \n
      Ваш пароль для входа: ${password}\n
      Не говорите их никому!`,
    };
    //отправляем почту
    transporter.sendMail(mailOptions)
    .then(() => resolve({result: true}))
    .catch(e => reject({ error: 'Произошла ошибка при отправке!' }));
  })
} 