const mongoose = require("mongoose");
const documentPresets = mongoose.model("documentsPresets");
const jwt = require('jwt-simple');
const config = require('../../../config');

// presets of routes
module.exports = (req, res) => {
  let token = jwt.decode(req.headers['token'], config.token.secretKey);
  documentPresets
    .find({ group: token.userGroup })
    .then(presets => {
      console.log(presets);
      res.status(201).json(presets);
    })
    .catch(err =>
      res
        .status(400)
        .json({
          message: "При поиске пресетов произошла ошибка: " + err.message
        })
    );
};