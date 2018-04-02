const mongoose = require("mongoose")
const documents = mongoose.model("documents")
const jwt = require('jwt-simple')
const config = require('../../../config')
const fs = require('fs')
const cyrToLat = require('../../../lib/cyrToLat')
// create new document
module.exports = (req, res) => {

  let dir = '/documents/' + req.file.filename
  // parsing array from json
  let fieldsRoutes = JSON.parse(req.body.routes)

  // create sigFile
  const sigFilePath = `/documents/${req.file.filename}.sig`
  fs.writeFileSync(`${__dirname}/../../../public${sigFilePath}`, '', 'utf-8')
  // add document (files and fields) to BD
  let newDocument = new documents({
    title: req.body.title,
    date: req.body.date,
    author: req.body.author,
    author_id: req.body.author_id,
    state: 0,
    total: req.body.total,
    globalStatus: 'waiting',
    groupToken: req.body.groupToken,
    routes: fieldsRoutes,
    versions: [
      {
        file: dir,
        version: req.body.version,
        date: req.body.date,
        status: 'waiting',
        description: req.body.description,
        sigFile: sigFilePath
      }
    ]
  })
  newDocument.routes[0].dateIncoming = Date.now()

  newDocument
    .save()
    .then(() =>
      res.status(201).json({ message: "Документ успішно опублікован" })
    )
    .catch(e =>
      res.status(400).json({
        message: `При додаванні документ виникла помилка: ${e.message}`
      })
    )
}