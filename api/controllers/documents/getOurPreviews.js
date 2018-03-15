const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

// find user publications
module.exports = (req, res) => {
  let token = jwt.decode(req.headers['token'], config.token.secretKey);
  documents
    .find({ author_id: token.userId }, { versions: 0 })
    .then(items => {
      res.status(201).json(items);
    })
    .catch(e => {
      console.error(e);
      res.status(404).json([]);
    });
};