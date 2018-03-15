const mongoose = require("mongoose")
const Groups = mongoose.model("groups")
const openpgp = require('openpgp')
const mailKeys = require('./../mailKeys')
const cyrToLat = require('../../../lib/cyrToLat')
const fs = require('fs');
import randomizer from '../../../lib/randomizer'

// generate passphrase, contain 2-6 words by 2-10 letters every word
function generatePassphrase () {
  let result = ''
  for (let i = 0; i < Math.ceil(Math.random() * 3 + 2); i++ ) {
    result += randomizer(Math.ceil(Math.random() * 5 + 2)) + ' '
  }
  return result.slice(0, -1).toString()
}

// generate openpgp keys,
// then mail that to user email
// and write public key on server
// and return path to this key
function generateAndSendKeys (keysOptions, userOptions) {

  const userName = cyrToLat(userOptions.name)
  const pubKeyName = `publicKey_${userName}.key`
  const privateKeyName = `privateKey_${userName}.key`
  const passphrase = generatePassphrase()
  console.log(passphrase)
  const options = {
    userIds: [{
      name: userName,
      email: userOptions.email
    }],
    numBits: 2048,
    keyExpirationTime: keysOptions.cerTime ? keysOptions.cerTime / 86400 : null,
    passphrase
  }
  
  return new Promise((resolve, reject) => {
    let pubKey = ''
    openpgp.generateKey(options)
      .then(keys => {
        pubKey = keys.publicKeyArmored
        console.log(passphrase)
        return mailKeys(
          userOptions.hostname,
          userOptions.name,
          userOptions.login,
          { name: pubKeyName, content: pubKey },
          { name: `privateKey_${userName}.key`, content: keys.privateKeyArmored },
          passphrase,
          userOptions.email
        )
      })
      .then(() => {
        fs.writeFile(`${__dirname}/../../../public/upload/${pubKeyName}`, pubKey, 'utf-8', (err) => {
          if (err) throw err
          resolve('/upload/' + pubKeyName)
        })
      })
      .catch(e => { console.log(e); reject(e) })
  })
}

module.exports = (req, res) => {
  console.log(req.body);
  Groups
    .findById(req.body.group)
    .then(group => {
      const userLogin = randomizer(5)
      // generate and mail keys
      return generateAndSendKeys(
        { cerTime: req.body.cerTime },
        { hostname: req.hostname, name: req.body.name, email: req.body.email, login: userLogin }
      ).then(pubKeyPath => {
        // add and save new user
        group.users.push({
          login: userLogin,
          author: req.body.name,
          role: req.body.role,
          publicKey: pubKeyPath,
          email: req.body.email,
          dateRegistration: Date.now()
        })
        return  group.save()
      })
    })
    .then(() => res.status(201).json({ message: "Пользователь успешно создан" }))
    .catch(e => res.status(400).json({message: `При создании пользователя произошла ошибка:  + ${e.message}`}));
};
