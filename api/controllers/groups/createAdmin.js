const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const jwt = require('jwt-simple');
const config = require('../../../config');
const mailer = require('./../mailer')
const cryptoPass = require('../../../lib/cryptoPass')
const randomizer = require('../../../lib/randomizer')

module.exports = (req, res) => {
  const hashSalt = cryptoPass.setPassword(randomizer(6))
  let groupName = ''
  Groups.findById(req.body.groupId)
    .then(group => {
      if (!group) throw new Error('Группа не существует!')
      groupName = group.name
      group.users.push({
        author: 'Администратор группы ' + groupName,
        role: group.groupInvite === 'superAdminGroup' ? 'superAdmin' : 'Admin',
        login:  randomizer(5),
        token:  randomizer(5),
        hash: hashSalt.hash,
        salt: hashSalt.salt,
        email: req.body.adminEmail,
        dateRegistration: Date.now()
      })
      console.log(group)
      return group.save()
    })
    .then(() => {
      return mailer({
        email: req.body.adminEmail,
        login: req.body.adminLogin,
        password: req.body.adminPassword,
        subject: 'Данные авторизации администратора группы '+ groupName })
    })
    .then(() =>
      res.status(201)
      .json({ message: "Группа успешно создана!\nПриглашение администратору отправлено на <"+ req.body.adminEmail+">\n"}))
    .catch(e => res.status(400).json({ message: 'При создании нового администратора произошла ошибка: ' + e.message }))
}