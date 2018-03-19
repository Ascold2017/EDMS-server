const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');
const fs = require('fs')

// create new version of document (if rejected)
module.exports = (req, res) => {

  // save directory
  let dir = "/documents/" + req.file.filename;
  // create new sigFile
  const sigFilePath = `/documents/${req.file.filename}.sig`
  fs.writeFileSync(`${__dirname}/../../../public${sigFilePath}`, '', 'utf-8')

  documents.findById(req.body.id)
    .then(document => {
      if (document.globalStatus !== 'rejected') {
        res.status(400).json({ message: 'Вы не можете создать новую версию! Предыдущая версия находится на рассмотрении!' });
        return;
      }
      // clear state and status
      document.state = 0;
      document.globalStatus = 'waiting';
      // add new version to begin array versions
      document.versions = document.versions.unshift({
        file: dir,
        version: req.body.version,
        date: req.body.date,
        description: req.body.description,
        status: 'waiting',
        sigFile: sigFilePath
      });
      // clear states of routes
      document.versions[0].status = 'waiting';
      document.routes = document.routes.map(route => {
        route.status = 'waiting';
        route.comment = '';
        return route;
      });
      // set dateIncoming for first route
      document.routes[0].dateIncoming = Date.now();
      // and upd document
      documents.findOneAndUpdate({ _id: document._id }, document, { upsert: true })
        .then(() =>
          res.status(201).json({ message: 'Версия успешно добавлена!' })
        )
        .catch(e =>
          res.status(400).json({
            error: `При добавление версии произошла ошибка:  + ${e.message}`
          })
        );

      console.log(document);
    })
    .catch(e =>
      res.status(400).json({
        error: `При добавление версии произошла ошибка:  + ${e.message}`
      })
    );
};