const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

// get document, whic publicate user
module.exports = (req, res) => {

  let token = jwt.decode(req.headers['token'], config.token.secretKey);

  documents
    .findOne({
      _id: req.params.id,
      groupToken: token.userGroup,
      "author_id": token.userId,
    })
    .then(item => {
      if (!item) {
        throw new Error("Документ не найден");
        return;
      }
      res.status(201).json(item);
    })
    .catch(e =>
      res.status(404).json({
        message: `Произошла ошибка:  + ${e.message}`
      })
    );
};