const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

module.exports = (req, res) => {
  let token = jwt.decode(req.headers['token'], config.token.secretKey);

  documents
    .findOne({
      _id: req.params.id,
      groupToken: token.userGroup, // only in current users group
      $or: [
        { routes: { $elemMatch: { _id: token.userId } } },
        { author_id: token.userId },
      ],
      globalStatus: ['resolved', 'archived'],
      })
    .then(item => res.status(201).json(item))
    .catch(err =>
      res
        .status(400)
        .json({
          message:
            "При поиске архивного документов произошла ошибка" + err.message
        })
    );
}