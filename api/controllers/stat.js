const mongoose = require("mongoose")
const documents = mongoose.model("documents")
const jwt = require('jwt-simple')
const config = require('../../config')

module.exports.getDocsStat = (req, res) => {
  let token = jwt.decode(req.headers['token'], config.token.secretKey)
  documents.find({ groupToken: token.userGroup },
    {
      _id: 0,
      __v: 0,
      title: 0,
      state: 0,
      'versions._id': 0,
      'versions.file': 0,
      'versions.description': 0,
      'versions.version': 0,
      'versions.rejectReason': 0,
      'routes.canSee': 0,
      'routes.comment': 0,
      })
  .then(docs => {
    res.status(201).json(docs)
  })
  .catch(e => res.status(400).json({message: 'Помилка: ' + e.message }))
}