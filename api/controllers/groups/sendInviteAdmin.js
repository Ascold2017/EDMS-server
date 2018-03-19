const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const mailer = require('./../mailer');
const cryptoPass = require('../../../lib/cryptoPass')
const randomizer = require('../../../lib/randomizer')

module.exports = (req, res) => {
  let adminLogin = ''
  let groupName = ''
  Groups.findOne({ 'users._id': req.body.adminId })
    .then(group => {
      const hashSalt = cryptoPass.setPassword(req.body.password)
      groupName = group.name
      const admin = group.users.find(user => user._id == req.body.adminId)
      admin.email = req.body.email
      admin.hash = hashSalt.hash
      admin.salt = hashSalt.salt
      adminLogin = admin.login
      return group.save()
    })
    .then(() =>
      mailer({
        group: groupName,
        adress: req.hostname,
        email: req.body.email,
        login: adminLogin,
        password: randomizer(6),
        subject: 'Доступы администратора группы: ' + groupName
      })
    )
    .then(() => res.status(200).json({ message: 'Доступы успешно отправлены на почту!' }))
    .catch(e => res.status(400).json({ message: 'При попытки отправки доступов произошла ошибка: ' + e.message }))
}