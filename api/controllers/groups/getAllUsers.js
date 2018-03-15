const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const jwt = require('jwt-simple');
const config = require('../../../config');

module.exports = (req, res) => {

    let token = jwt.decode(req.headers['token'], config.token.secretKey);
    Groups.findOne({ groupInvite: token.userGroup })
      .select('users')
      .exec((err, usersObj) => {

        if (err) { res.status(400).json({ error: 'Произошла ошибка: ' + err}); return; }
        if(!usersObj) { res.status(400).json({ error: 'Такой группы нет!' }); return; }
        let users = [];
        usersObj.users.map(user => {
          if (user.role !== 'Admin') {
            const showUser = {
              _id: user._id,
              role: user.role,
              login: user.login,
              author: user.author,
              publicKey: user.publicKey
            };
            users.push(showUser);
          }
        });
        console.log(users)
        res.status(201).json(users);
      });
  };