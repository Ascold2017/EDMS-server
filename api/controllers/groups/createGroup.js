const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const jwt = require('jwt-simple');
const config = require('../../../config');
const mailer = require('./../mailer')
const cryptoPass = require('../../../lib/cryptoPass')
const randomizer = require('../../../lib/randomizer')

module.exports = (req, res) => {
  const hashSalt = cryptoPass.setPassword(randomizer(6))
  const newGroupBody = {
    name: req.body.name,
    groupInvite: randomizer(5),
    users: [{
      author: 'Администратор группы ' + req.body.name,
      role: 'Admin',
      token: randomizer(5),
      login: randomizer(5),
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