const mongoose = require("mongoose");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const documents = mongoose.model("documents");

// find documents, which have waiting status for user, which exist in routes and he can see this document
module.exports.getPreviewsByToken = (req, res) => {
  console.log(req.session.userId);
  documents
    .find(
      { groupToken: req.session.userGroup, // only in current users group
        routes: { $elemMatch: { _id: req.session.userId, canSee: 'yes', status: 'waiting' } } },
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
  documents
    .find({ author_id: req.session.userId }, { versions: 0 })
    .then(items => {
      console.log(req.session.userId);
      res.status(201).json(items);
    })
    .catch(e => {
      console.error(e);
      res.status(404).json([]);
    });
};

// get document, which can see user
module.exports.getDocumentById = (req, res) => {
  documents
    .findOne({
        _id: req.params.id,
        groupToken: req.session.userGroup,
        routes: {
            $elemMatch: {
                _id: req.session.userId,
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
    documents
      .findOne({
          _id: req.params.id,
          groupToken: req.session.userGroup,
          "author_id": req.session.userId,
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
  let form = new formidable.IncomingForm();
  let upload = "public/upload";
  let fileName;
  // create upload dir
  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }

  // uploading file
  form.uploadDir = path.join(process.cwd(), upload);
  // parsing req form
  form.parse(req, function(err, fields, files) {
    // get filename
    fileName = path.join(upload, files.file.name);
    // rename file
    fs.rename(files.file.path, fileName, function(err) {
      // if error - delete file
      if (err) {
        console.log(err);
        fs.unlink(fileName);
        fs.rename(files.file.path, fileName);
      }
      // save directory
      let dir = '/upload/' + files.file.name;
      // parsing array from json
      let fieldsRoutes = JSON.parse(fields.routes);

      // add document (files and fields) to BD
      let newDocument = new documents({
        title: fields.title,
        date: fields.date,
        author: fields.author,
        author_id: fields.author_id,
        state: 0,
        total: fields.total,
        globalStatus: 'waiting',
        groupToken: fields.groupToken,
        routes: fieldsRoutes,
        versions: [
          {
            file: dir,
            version: fields.version,
            date: fields.date,
            status: 'waiting',
            description: fields.description,
          }
        ]
      });
      console.log(newDocument);
      
      newDocument
        .save()
        .then(() =>
          res.status(201).json({ message: "Запись успешно добавлена" })
        )
        .catch(e =>
          res.status(400).json({
            message: `При добавление записи произошла ошибка:  + ${e.message}`
          })
        );
        
    });
  });
};

// create new version of document (if rejected)
module.exports.postNewVersion = (req, res) => {
  
  let form = new formidable.IncomingForm();
  let upload = "public/upload";
  let fileName;

  // uploading file
  form.uploadDir = path.join(process.cwd(), upload);
  // parsing req form
  form.parse(req, (err, fields, files) => {
    // get filename
    fileName = path.join(upload, files.file.name);
    // rename file
    fs.rename(files.file.path, fileName, (err) => {
      // if error - delete file
      if (err) {
        console.log(err);
        fs.unlink(fileName);
        fs.rename(files.file.path, fileName);
      }
      // save directory
      let dir = "/upload/" + files.file.name;

      documents.findById(fields.id)
        .then(document => {

          document.state = 0;
          document.globalStatus = 'waiting';
          document.versions = document.versions.unshift({
            file: dir,
            version: fields.version,
            date: fields.date,
            description: fields.description,
            status: 'waiting',
          });

          document.versions[0].status = 'waiting';
          document.routes = document.routes.map(route => {
              route.status = 'waiting';
              route.comment = '';
              return route;
          });

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
    });
  });
};

module.exports.postVote = (req, res) => {
  console.log(req.body.id);

  documents.findById(req.body.id).then(doc => {
    console.log(doc);
    // find author of vote in routes and his route index in routes
    let currentIndex = 0;
    let author = doc.routes.find((route, index) => {
        currentIndex = index;
        return route.author === req.body.author.author;
    });
    // fitering false vote
    if (!author || doc.routes.find(route => route.author === author)) {
      // if author not exist
      res.status(400).json({ message: "Вы не можете проголосовать!" });
      return;
    }
    // filtering double-vote
    if (author.status !== "waiting") {
      // if author not exist
      res.status(400).json({ message: "Вы уже проголосовали!" });
      return;
    }
    // set changes for author
    author.status = req.body.vote;
    author.comment = req.body.comment;
    doc.state++;
    // check globalStatus
    let checkAllWaiting = false;
    // if new vote is no reject and all routes not completed
    if (author.status !== "reject" && doc.state < doc.total) {
      // go to next route - allow see doc for next author in routes
      console.log('currentIndex', currentIndex);
      doc.routes[currentIndex + 1].canSee = 'yes';
    } else
    // new vote is reject
    if (author.status === "reject") {
      doc.globalStatus = "rejected";
      doc.versions[0].status = 'rejected';
      // todo - send mail
    }
    // new vote is resolve and its last author in routes
    else {
        doc.globalStatus = "resolved";
        doc.versions[0].status = 'resolved';
        // todo - send mail
    }
    // save changes
    doc
      .save()
      .then(() => {
        res.status(201).json({ message: "Голос зачтен!" });
      })
      .catch(err =>
        res.status(400).json({
          message: `При обновлении записи произошла ошибка: ${err.message}`
        })
      );
  });
};

module.exports.getArchiveDocuments = (req, res) => {
  documents
    .find({
      groupToken: req.session.userGroup, // only in current users group
      $or: [
        { routes: { $elemMatch: { _id: req.session.userId } } },
        { author_id: req.session.userId },
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

// presets of routes
const documentPresets = mongoose.model("documentsPresets");

module.exports.getPresets = (req, res) => {
  documentPresets
    .find({})
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
