const mongoose = require("mongoose")
const documents = mongoose.model("documents")
const fs = require('fs')
const openpgp = require('openpgp')

function verifySign (index, sigs, file, routes) {
  if (!sigs[index]) return Promise.resolve('Всі підписи веріфіковані!')
  const publicDir = __dirname + '/../../../public'
  const pubKey = fs.readFileSync(publicDir + routes[index].publicKey, 'utf-8')

  const verifyOptions = {
    message: openpgp.message.fromBinary(file), // input as Message object
    signature: openpgp.signature.readArmored(sigs[index]), // parse detached signature
    publicKeys: openpgp.key.readArmored(pubKey).keys   // for verification
  }
  return new Promise(resolve => {
    openpgp.verify(verifyOptions)
    .then(verified => {
      if (verified.signatures[0].valid) {
        if (index === routes.length - 1) {
          resolve('Всі підписи веріфіковані!')
        } else {
          resolve(verifySign(++index, sigs, file, [...routes]))
        }
      } else {
        resolve(`Підпис ${routes[index].author} невірний!`)
      }
    })
  })
}


module.exports = (req, res) => {
  // todo - verify sigs
  documents.findById(req.params.id)
    .then(doc => {
      const publicDir = __dirname + '/../../../public'
      const file = fs.readFileSync(publicDir + doc.versions[0].file)
      const sigFile = fs.readFileSync(publicDir + doc.versions[0].sigFile, 'utf-8')
      const sigs = sigFile.split('--signature--\n')
      if (sigs.length - 1) {
        verifySign(0, sigs, file, [...doc.routes])
          .then(check => {
            res.status(201).json({ message: check })
          })
      } else {
        res.status(201).json({ message: 'Підписів немає' }) 
      }
    })
    .catch(e => res.status(400).json({ message: e.message || e }))
}