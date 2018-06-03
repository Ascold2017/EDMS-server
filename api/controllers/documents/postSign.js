const mongoose = require("mongoose")
const documents = mongoose.model("documents")
const jwt = require('jwt-simple')
const config = require('../../../config')
const openpgp = require('openpgp')
const fs = require('fs')
const publicPath = __dirname + '/../../../public'

module.exports = (req, res) => {
  documents.findById(req.body.id)
  .then(doc => {
    console.log(doc)
    // find author of vote in routes and his route index in routes
    let currentIndex = 0
    let author = doc.routes.find((route, index) => {
        currentIndex = index
        return route.author === req.body.author.author
    })

    // fitering false vote
    if (!author || doc.routes.find(route => route.author === author)) {
      // if author not exist
      res.status(400).json({ message: "Ви не можете підписати документ!" })
      return
    }
    // filtering double-vote
    if (author.status !== "waiting") {
      // if author not exist
      res.status(400).json({ message: "Ви вже підписували/відмовляли в підписі!" })
      return
    }

    if (req.body.vote === 'resolve') {

      console.log(author)
      const fileDocument = fs.readFileSync(publicPath + doc.versions[0].file)
      const publicKeyFile = fs.readFileSync(publicPath + author.publicKey, 'utf-8')
      let sigFile = fs.readFileSync(publicPath + doc.versions[0].sigFile, 'utf-8')

      const verifyOptions = {
        message: openpgp.message.fromBinary(fileDocument), // input as Message object
        signature: openpgp.signature.readArmored(req.body.signature), // parse detached signature
        publicKeys: openpgp.key.readArmored(publicKeyFile).keys   // for verification
      }

      openpgp.verify(verifyOptions)
      .then(verified => {
        // if signature is VALID
        if (verified.signatures[0].valid) {

          // set changes for author
          author.status = req.body.vote
          author.comment = req.body.comment
          author.dateSigning = Date.now()
          doc.state++

          // write sign to sig file
          sigFile += req.body.signature + '--signature--\n'
          fs.writeFileSync(publicPath + doc.versions[0].sigFile, sigFile, 'utf-8')

          // if sign and this author not a last in routes
          if (doc.state < doc.total) {
            // go to next route - allow see doc for next author in routes
            doc.routes[currentIndex + 1].canSee = 'yes'
            doc.routes[currentIndex + 1].dateIncoming = Date.now()
          } else {
            // if author is last in routes - set globalStatus
            doc.globalStatus = "resolved"
            doc.versions[0].status = 'resolved'
            doc.resolveDate = Date.now()
            // todo - send mail
          }

        } else {
          // if signature INVALID
          res.status(403).json({message: 'Ваш сертифікат недійсний!'})
          return
        }
      })
      
    } else {
      doc.globalStatus = "rejected"
      doc.versions[0].status = 'rejected'
      doc.versions[0].rejectReason = `Відмовив в підписі: ${author.author}. Причина відмови: ${req.body.comment}`
    }

    // save changes
    doc
      .save()
      .then(() => {
        res.status(201).json({ message: req.body.vote === 'resolve' ? "Ви підписали документ" : "Ви відмовили в підписі" })
      })
      .catch(err =>
        res.status(400).json({
          message: `При відновленні запису вникла помилка: ${err.message}`
        })
      )
  })
}