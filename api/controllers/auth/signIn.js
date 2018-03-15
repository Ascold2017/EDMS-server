const express = require('express');
const mongoose = require('mongoose');
const Groups = mongoose.model('groups');
const cryptoPass = require('../../../lib/cryptoPass');
const jwt = require('jwt-simple');
const config = require('../../../config');
const fs = require('fs');
const openpgp = require('openpgp')

module.exports = (req, res) => {

  Groups.findOne({ $or: [{ 'users.login': req.body.userLogin }, { 'users.email': req.body.userLogin }] },
    (err, group) => {
      if (err) { res.status(400).json({ error: 'Произошла ошибка! ' + err }); return; }
      if (!group) {
        res.status(400).json({ message: 'Пользователь не найден!' });
        return;
      }
      const user = group.users.find(user => user.login === req.body.userLogin || user.email === req.body.userLogin);
      const uploadDir = __dirname + '/../../../public'
      const publicKey = fs.readFileSync(uploadDir + user.publicKey, 'utf-8')
      // todo - verify cert
      openpgp.verify({
        message: openpgp.cleartext.readArmored(req.body.certificate),
        publicKeys: openpgp.key.readArmored(publicKey).keys
      }).then(verified => {
        
        if (verified.signatures[0].valid) {
          // create token
          let token = jwt.encode({
            isAuth: true,
            userId: user._id,
            userGroup: group.groupInvite
          }, config.token.secretKey);
          console.log('signed by key id ' + verified.signatures[0].keyid.toHex());
          // and send response
          res.status(200).json({ message: 'Вы успешно авторизовались!', token });
        } else {
          res.status(403).json({ message: 'Неверный/недействительный ключ!' });
        }
      })
    })
}