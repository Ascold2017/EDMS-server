const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

// find documents, which have waiting status for user, which exist in routes and he can see this document
module.exports = (req, res) => {
  let token = jwt.decode(req.headers['token'], config.token.secretKey);
  documents
    .find(
      { groupToken: token.userGroup, // only in current users group
        routes: { $elemMatch: { _id: token.userId, canSee: 'yes', status: 'waiting' } } },
      { versions: 0 } // reduce document files
    )
    .then(items => res.status(201).json(items))
    .catch(e => {
      console.error(e);
      res.status(404).json({});
    });
    
};