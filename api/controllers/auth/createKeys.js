const openpgp = require('openpgp')
const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const mailKeys = require('./../mailKeys');
const cyrToLat = require('../../../lib/cyrToLat')
const fs = require('fs');
import randomizer from '../../../lib/randomizer'

module.exports = (req, res) => {
  let user = null
  console.log(req.body)
  const userName = cyrToLat(req.body.cert.name)
  const pubKeyName = `publicKey_${userName}.key`
  const passphrase = randomizer(10) + ' ' + randomizer(10) + ' ' + randomizer(10) + ' ' + randomizer(10)
  const generateKeysOptions = {
    userIds: [req.body.cert],
    numBits: 2048,
    passphrase
  }
  function createAndSendKeys(user) {
    let pubKey = ''
    return new Promise((resolve, reject) => {
      openpgp.generateKey(generateKeysOptions)
      .then(keys => {
        pubKey = keys.publicKeyArmored
        return mailKeys(
          { name: pubKeyName, content: pubKey },
          { name: `privateKey_${userName}.key`, content: keys.privateKeyArmored },
          passphrase,
          req.body.cert.email
        )
      })
      .then(() => {
        fs.writeFile(`${__dirname}/../../../public/upload/${pubKeyName}`, pubKey, 'utf-8', (err) => {
          if (err) throw err
          user.publicKey = '/upload/' + pubKeyName
          resolve()
        })
      })
      .catch(e => reject(e.message))
    })
  }

  Groups.findOne({ 'users._id': req.body.userId })
    .then(group => {
      user = group.users.find(user => user._id == req.body.userId)
      return createAndSendKeys(user)
      .then(() => {
        return group.save()
      })
    })
    .then(response => res.status(200).json({ message: 'Ключи успешно созданы и отправлены по указаному e-mail!' }))
    .catch(e => res.status(400).json({message: 'При создании ключей произошла ошибка: ' + e }))
}