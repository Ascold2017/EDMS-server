const nodemailer = require('nodemailer');
const express = require('express');
const config = require('../../config.json');

module.exports = (req, res) => {
    //инициализируем модуль для отправки писем и указываем данные из конфига
    console.log(req.body);
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
      from: `"Администратор EDMS" <ascold96@gmail.com>`,
      to: req.body.email,
      subject: req.body.subject,
      text: `Ваш логин EDMS: ${req.body.login} \n Ваш инвайт-код: ${req.body.token}\n Инвайт-код группы: ${ req.body.groupInvite ? req.body.groupInvite : req.body.token} \n Не говорите их никому!`,
    };
      //отправляем почту
      transporter.sendMail(mailOptions)
      .then(() => res.status(200).json({result: true}))
      .catch(e => { console.error('error', e); res.status(400).json({ error: 'Произошла ошибка при отправке!' }); });
  } 