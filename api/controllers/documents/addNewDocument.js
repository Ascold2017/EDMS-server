const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

// create new document
module.exports = (req, res) => {
  console.log(req.file, req.body);
  // save directory
  let dir = '/upload/' + req.file.filename;
  // parsing array from json
  let fieldsRoutes = JSON.parse(req.body.routes);

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
      }
    ]
  });
  newDocument.routes[0].dateIncoming = Date.now();
  console.log(newDocument);

  newDocument
    .save()
    .then(() =>
      res.status(201).json({ message: "Документ успешно опубликован" })
    )
    .catch(e =>
      res.status(400).json({
        message: `При добавление документа произошла ошибка:  + ${e.message}`
      })
    );
};