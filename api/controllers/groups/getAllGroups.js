const mongoose = require("mongoose")
const Groups = mongoose.model("groups")
const jwt = require('jwt-simple')
const config = require('../../../config')

module.exports = (req, res) => {
  Groups
    .find({}, { 'users.hash': 0, 'users.salt': 0 })
    .then(groups => res.status(201).json(groups))
    .catch(e => res.status(400).json({ message: e.message }))
}