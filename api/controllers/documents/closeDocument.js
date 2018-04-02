const mongoose = require("mongoose")
const documents = mongoose.model("documents")
const jwt = require('jwt-simple')
const config = require('../../../config')

module.exports = (req, res) => {
  documents.findByIdAndUpdate(req.body.id, { globalStatus: 'archived' })
    .then(items => res.status(201).json({ message: 'Документ в архіві!' }))
    .catch(err =>
      res
        .status(400)
        .json({
          message:
            "При відправці в архів виникла помилка: " + err.message
        })
    )
}
