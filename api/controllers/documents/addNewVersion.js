const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');

// create new version of document (if rejected)
module.exports = (req, res) => {

  // save directory
  let dir = "/upload/" + req.file.filename;

  documents.findById(req.body.id)
    .then(document => {
      if (document.globalStatus !== 'rejected') {
        res.status(400).json({ message: 'Вы не можете создать новую версию! Предыдущая версия находится на рассмотрении!' });
        return;
      }
      document.state = 0;
      document.globalStatus = 'waiting';
      document.versions = document.versions.unshift({
        file: dir,
        version: req.body.version,
        date: req.body.date,
        description: req.body.description,
        status: 'waiting',
      });

      document.versions[0].status = 'waiting';
      document.routes = document.routes.map(route => {
        route.status = 'waiting';
        route.comment = '';
        return route;
      });
      document.routes[0].dateIncoming = Date.now();

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