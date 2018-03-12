const nodemailer = require('nodemailer');
const express = require('express');
const config = require('../../config.json');

module.exports = ({ email, login, password, subject }) => {
  //инициализируем модуль для отправки писем и указываем данные из конфига
  return new Promise((resolve, reject) => {
    console.log(email, login, password);
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
      from: `"Администратор EDMS" <ascold96@gmail.com>`,
      to: email,
      subject,
      text: `Ваш логин EDMS: ${login} \nВаш пароль для входа: ${password}\nНе говорите их никому!`,
    };
    //отправляем почту
    transporter.sendMail(mailOptions)
    .then(() => resolve({result: true}))
    .catch(e => reject({ error: 'Произошла ошибка при отправке!' }));
  })
} 