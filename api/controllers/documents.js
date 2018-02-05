const mongoose = require("mongoose");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const documents = mongoose.model("documents");

module.exports.getPreviewsByToken = (req, res) => {
  console.log(req.session.userId);
  documents // 
    .find(
      { token: req.session.userGroup, routes: { $elemMatch: { _id: req.session.userId, canSee: 'yes' } } },
      { document: 0 }
    )
    .then(items => {
        items.forEach(item => console.log(item.routes));
      res.status(201).json(items);
    })
    .catch(e => {
      console.error(e);
      res.status(404).json({});
    });
};

module.exports.getOurPreviews = (req, res) => {
  documents
    .find({ author_id: req.session.userId })
    .then(items => {
      console.log(req.session.userId);
      res.status(201).json(items);
    })
    .catch(e => {
      console.error(e);
      res.status(404).json([]);
    });
};

module.exports.getDocumentById = (req, res) => {
  documents
    .findOne({
        _id: req.params.id,
        token: req.session.userGroup,
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

module.exports.getMyDocumentById = (req, res) => {
    documents
      .findOne({
          _id: req.params.id,
          token: req.session.userGroup,
          "routes._id": req.session.userId,
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
    console.log(files.file);
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
      let dir = "http://localhost:3000/upload/" + files.file.name; //.substr(fileName.indexOf('//'));
      // parsing array from json
      let fieldsRoutes = JSON.parse(fields.routes);

      // add document (files and fields) to BD
      let newDocument = new documents({
        ...fields,
        routes: fieldsRoutes,
        document: dir
      });
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
      // todo - send mail
    }
    // new vote is resolve and its last author in routes
    else {
        doc.globalStatus = "resolved";
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
    .find({ globalStatus: "resolved" })
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
