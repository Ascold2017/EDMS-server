const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const jwt = require('jwt-simple');
const config = require('../../../config');
const mailer = require('./../mailer')
const cryptoPass = require('../../../lib/cryptoPass')

module.exports = (req, res) => {
  const hashSalt = cryptoPass.setPassword(req.body.adminPassword)
  const newGroupBody = {
    name: req.body.name,
    groupInvite: req.body.invite,
    users: [{
      author: 'Администратор группы ' + req.body.name,
      role: 'Admin',
      token: req.body.adminInvite,
      login: req.body.adminLogin,
      hash: hashSalt.hash,
      salt: hashSalt.salt,
      email: req.body.adminEmail,
      dateRegistration: Date.now()
     }]
  };
  const newGroup = new Groups(newGroupBody);
  console.log(newGroup);
  newGroup
    .save()
    .then(() => {
      return mailer({
        email: req.body.adminEmail,
        login: req.body.adminLogin,
        password: req.body.adminPassword,
        subject: 'Данные авторизации администратора группы '+ req.body.name })
    })
    .then(() => res.status(201).json({ message: "Группа успешно создана!\nПриглашение администратору отправлено на <"+ req.body.adminEmail+">\n"}))
    .catch(e => {
      console.log(e.message);
      res.status(400).json({
        message: `При создании группы произошла ошибка:  + ${e.message}`
      })
    });
};