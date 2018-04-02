const mongoose = require("mongoose")
const Groups = mongoose.model("groups")
const jwt = require('jwt-simple')
const config = require('../../../config')
const mailer = require('./../mailer')
const cryptoPass = require('../../../lib/cryptoPass')
const randomizer = require('../../../lib/randomizer').default

module.exports = (req, res) => {
  let groupName = ''
  const login = randomizer(5)
  const password = randomizer(6)
  const hashSalt = cryptoPass.setPassword(password)
  Groups.findById(req.body.groupId)
    .then(group => {
      if (!group) throw new Error('Группа не існує!')
      groupName = group.name
      group.users.push({
        author: 'Администратор группы ' + groupName,
        role: group.groupInvite === 'superAdminGroup' ? 'superAdmin' : 'Admin',
        login:  login,
        token:  randomizer(5),
        hash: hashSalt.hash,
        salt: hashSalt.salt,
        email: req.body.adminEmail,
        dateRegistration: Date.now()
      })
      return group.save()
    })
    .then(() => {
      return mailer({
        group: groupName,
        adress: req.hostname,
        email: req.body.adminEmail,
        login: login,
        password: password,
        subject: 'Дані авторизації адміністратора групи '+ groupName })
    })
    .then(() =>
      res.status(201)
      .json({ message: "Група успішно створена!\nЗапрошення адміністратору відправлено на <"+ req.body.adminEmail+">\n"}))
    .catch(e => res.status(400).json({ message: 'При створенні нового адміністратора виникла помилка: ' + e.message }))
}