const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

module.exports = (req, res) => {
  console.log(req.body.id);
  documents.findByIdAndUpdate(req.body.id, { globalStatus: 'archived' })
    .then(items => res.status(201).json({ message: 'Документ в архиве!' }))
    .catch(err =>
      res
        .status(400)
        .json({
          message:
            "При отправке в архив произошла ошибка: " + err.message
        })
    );
};
