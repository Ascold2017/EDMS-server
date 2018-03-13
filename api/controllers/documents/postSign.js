const mongoose = require("mongoose");
const documents = mongoose.model("documents");
const jwt = require('jwt-simple');
const config = require('../../../config');
const openpgpg = require('openpgp')

module.exports = (req, res) => {
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
    // todo - verify sign
    const verify = true;
    if (verify) {
      // set changes for author
      author.status = req.body.vote;
      author.comment = req.body.comment;
      author.dateSigning = Date.now();
      doc.state++;
    } else {
      res.status(403).json({message: 'Ваш сертификат недействителен!'});
      return;
    }
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
        doc.resolveDate = Date.now();
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