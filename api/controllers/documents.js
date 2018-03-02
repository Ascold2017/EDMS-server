const mongoose = require("mongoose");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../config');


// find documents, which have waiting status for user, which exist in routes and he can see this document
module.exports.getPreviewsByToken = (req, res) => {
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

// find user publications
module.exports.getOurPreviews = (req, res) => {
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

// get document, which can see user
module.exports.getDocumentById = (req, res) => {

  let token = jwt.decode(req.headers['token'], config.token.secretKey);

  documents
    .findOne({
        _id: req.params.id,
        groupToken: token.userGroup,
        routes: {
            $elemMatch: {
                _id: token.userId,
                canSee: 'yes'
            }
        }
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

// get document, whic publicate user
module.exports.getMyDocumentById = (req, res) => {

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

// create new document
module.exports.addNewDocument = (req, res) => {
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

// create new version of document (if rejected)
module.exports.postNewVersion = (req, res) => {
  
  // save directory
  let dir = "/upload/" + req.file.filename;

  documents.findById(req.body.id)
    .then(document => {
      if (document.globalStatus !== 'rejected') {
        res.status(400).json({message: 'Вы не можете создать новую версию! Предыдущая версия находится на рассмотрении!'});
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

      documents.findOneAndUpdate({ _id: document._id }, document, {upsert: true})
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

module.exports.postVote = (req, res) => {
  documents.findById(req.body.id)
  .then(doc => {
    // find author of vote in routes and his route index in routes
    let currentIndex = 0;
    let author = doc.routes.find((route, index) => {
        currentIndex = index;
        return route.author === req.body.author.author;
    });
    // fitering false vote
    if (!author || doc.routes.find(route => route.author === author)) {
      // if author not exist
      res.status(400).json({ message: "Вы не можете подписать документ!" });
      return;
    }
    // filtering double-vote
    if (author.status !== "waiting") {
      // if author not exist
      res.status(400).json({ message: "Вы уже подписывали/отказывали в подписи!" });
      return;
    }
    // set changes for author
    author.status = req.body.vote;
    author.comment = req.body.comment;
    author.dateSigning = Date.now();
    doc.state++;
    // check globalStatus
    let checkAllWaiting = false;
    // if new vote is no reject and all routes not completed
    if (author.status !== "reject" && doc.state < doc.total) {
      // go to next route - allow see doc for next author in routes
      doc.routes[currentIndex + 1].canSee = 'yes';
      doc.routes[currentIndex + 1].dateIncoming = Date.now();
    } else
    // new vote is reject
    if (author.status === "reject") {
      doc.globalStatus = "rejected";
      doc.versions[0].status = 'rejected';
      doc.versions[0].rejectReason = `Отказал в подписи: ${author.author}. Причина отказа: ${author.comment}`;
      // todo - send mail
    }
    // new vote is resolve and its last author in routes
    else {
        doc.globalStatus = "resolved";
        doc.versions[0].status = 'resolved';
        // todo - send mail
    }
    console.log(doc);
    // save changes
    doc
      .save()
      .then(() => {
        res.status(201).json({ message: author.status === 'resolve' ? "Вы подписали документ" : "Вы отказали в подписи" });
      })
      .catch(err =>
        res.status(400).json({
          message: `При обновлении записи произошла ошибка: ${err.message}`
        })
      );
  });
};

module.exports.getArchiveDocuments = (req, res) => {

  let token = jwt.decode(req.headers['token'], config.token.secretKey);

  documents
    .find({
      groupToken: token.userGroup, // only in current users group
      $or: [
        { routes: { $elemMatch: { _id: token.userId } } },
        { author_id: token.userId },
      ],
      globalStatus: ['resolved', 'archived'],
      },
      { versions: 0 })
    .then(items => res.status(201).json(items))
    .catch(err =>
      res
        .status(400)
        .json({
          message:
            "При поиске ахивных документов произошла ошибка" + err.message
        })
    );
};

module.exports.closeDocument = (req, res) => {
  console.log(req.body.id);
  documents.findByIdAndUpdate(req.body.id, { globalStatus: 'archived' })
  .then(items => res.status(201).json({ message: 'Документ в архиве!'}))
    .catch(err =>
      res
        .status(400)
        .json({
          message:
            "При отправке в архив произошла ошибка: " + err.message
        })
    );
};

// presets of routes
const documentPresets = mongoose.model("documentsPresets");

module.exports.getPresets = (req, res) => {
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

module.exports.createPreset = (req, res) => {
  console.log(req.body);
  let newPreset = new documentPresets(req.body);
  newPreset
    .save()
    .then(() => res.status(201).json({ message: "Пресет успешно добавлен!" }));
};
