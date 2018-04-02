const mongoose = require("mongoose")
const documentPresets = mongoose.model("documentsPresets")
const jwt = require('jwt-simple')
const config = require('../../../config')

// presets of routes
module.exports = (req, res) => {
  const newPreset = new documentPresets(req.body)
  newPreset
    .save()
    .then(() => res.status(201).json({ message: "Список успішно додан!" }))
}