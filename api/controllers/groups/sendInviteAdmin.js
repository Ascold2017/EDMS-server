const mongoose = require("mongoose")
const Groups = mongoose.model("groups")
const mailer = require('./../mailer')
const cryptoPass = require('../../../lib/cryptoPass')
const randomizer = require('../../../lib/randomizer').default

module.exports = (req, res) => {
  let adminLogin = ''
  let groupName = ''
  const password = randomizer(6)
  Groups.findOne({ 'users._id': req.body.adminId })
    .then(group => {
      const hashSalt = cryptoPass.setPassword(password)
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
        password: password,
        subject: 'Доступи адміністратора групи: ' + groupName
      })
    )
    .then(() => res.status(200).json({ message: 'Доступи успішно відправлені на почту!' }))
    .catch(e => res.status(400).json({ message: 'При спробі відправки доступів виникла помилка: ' + e.message }))
}