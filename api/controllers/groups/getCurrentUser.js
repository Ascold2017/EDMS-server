const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const jwt = require('jwt-simple');
const config = require('../../../config');

module.exports = (req, res) => {

    let token = jwt.decode(req.headers['token'], config.token.secretKey);
    Groups.findOne({ users: { $elemMatch: { _id: token.userId }}}, (err, doc) => {
      if (err) res.status(400).json({ error: 'Произошла ошибка: ' + err});
      if (!doc) {
        res.status(400).json({ error: 'Произошла ошибка - пользователь не найден' });
        return;
      }
      const user = doc.users.find(user => user._id == token.userId);
      const showUser = {
        _id: user._id,
        role: user.role,
        login: user.login,
        author: user.author,
        groupInvite: doc.groupInvite,
      };
      console.log(showUser);
      res.status(201).json(showUser)
    });
  };