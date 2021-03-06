const mongoose = require("mongoose")
const Groups = mongoose.model("groups")
const jwt = require('jwt-simple')
const config = require('../../../config')

module.exports = (req, res) => {
  const token = jwt.decode(req.headers['token'], config.token.secretKey)
  Groups.findOne({ groupInvite: token.userGroup })
    .select('users')
    .exec((err, usersObj) => {
      if (err) {
        res.status(400).json({ error: 'Виникла помилка: ' + err})
        return
      }
      if(!usersObj) {
        res.status(400).json({ error: 'Такої групи немає!' })
        return
      }
      let users = []
      usersObj.users.map(user => {
        if (user.role !== 'Admin') {
          const showUser = {
            _id: user._id,
            role: user.role,
            login: user.login,
            author: user.author,
            publicKey: user.publicKey
          }
          users.push(showUser)
        }
      })
      res.status(201).json(users)
    })
}