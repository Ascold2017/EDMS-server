const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

module.exports = (req, res) => {

  let token = jwt.decode(req.headers['token'], config.token.secretKey);

  documents
    .find({
      groupToken: token.userGroup, // only in current users group
      $or: [
        { routes: { $elemMatch: { _id: token.userId } } },
        { author_id: token.userId },
      ],
      globalStatus: ['resolved', 'archived'],
      },
      { versions: 0 })
    .then(items => res.status(201).json(items))
    .catch(err =>
      res
        .status(400)
        .json({
          message:
            "При поиске ахивных документов произошла ошибка" + err.message
        })
    );
};