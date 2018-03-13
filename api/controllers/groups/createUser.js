const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const jwt = require('jwt-simple');
const config = require('../../../config');


const mailer = require('./../mailer')
const cryptoPass = require('../../../lib/cryptoPass')

module.exports = (req, res) => {
  console.log(req.body);
  Groups
    .findById(req.body.group)
    .then(group => {
      console.log(req.file.filename)
      group.users.push({
        token: req.body.invite,
        role: req.body.role,
        email: req.body.email
      });
      /*
      group
        .save()
        .then(() =>
          res.status(201).json({ message: "Пользователь успешно создан" })
        )
        .catch(e =>
          res.status(400).json({
            message: `При создании пользователя произошла ошибка:  + ${
              e.message
            }`
          })
        );
        */
    })
    .catch(e =>
      res.status(400).json({
        message: `При создании пользователя произошла ошибка (группа не найдена):  + ${
          e.message
        }`
      })
    );
};
