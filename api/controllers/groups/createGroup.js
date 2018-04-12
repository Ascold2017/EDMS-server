const mongoose = require("mongoose")
const Groups = mongoose.model("groups")
const jwt = require('jwt-simple')
const config = require('../../../config')
const mailer = require('./../mailer')
const cryptoPass = require('../../../lib/cryptoPass')
const randomizer = require('../../../lib/randomizer').default

module.exports = (req, res) => {
  const password = randomizer(6)
  const hashSalt = cryptoPass.setPassword(password)
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
  }
  const newGroup = new Groups(newGroupBody)
  newGroup
    .save()
    .then(() => {
      return mailer({
        group: req.body.name,
        adress: req.hostname,
        email: newGroupBody.users[0].email,
        login: newGroupBody.users[0].login,
        password: password,
        subject: 'Дані авторизації адміністратора групи '+ req.body.name })
    })
    .then(() => res.status(201).json({ message: "Група успішно створена!\nЗапрошення адміністратору відправлено на <"+ req.body.adminEmail+">\n"}))
    .catch(e => {
      res.status(400).json({
        message: `При створенні групи виникла помилка:  + ${e.message}`
      })
    })
}