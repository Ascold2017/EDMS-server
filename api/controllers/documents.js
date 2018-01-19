const mongoose = require('mongoose');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

module.exports.getPreviewsByToken = (req, res) => {
    const documents = mongoose.model('documents');
    documents.find({token: req.params.token }, { document: 0 })
    .then(items => res.send(items))
    .catch(e => console.error(e));
};

module.exports.getDocumentById = (req, res) => {
    const documents = mongoose.model('documents');

    documents.findById(req.params.id)
    .then(item => res.send(item))
    .catch(e => console.error(e));
};

module.exports.addNewDocument = (req, res) => {
    let form = new formidable.IncomingForm();
    let upload = 'public/upload';
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
        fs.rename(files.file.path, fileName, function (err) {
            // if error - delete file
            if (err) {
              console.log(err);
              fs.unlink(fileName);
              fs.rename(files.file.path, fileName);
            }
            // save directory
            let dir = 'http://localhost:3000' + fileName;//.substr(fileName.indexOf('//'));
            // parsing array from json
            let fieldsRoutes = JSON.parse(fields.routes);

            // add document (files and fields) to BD
            const document = mongoose.model('documents');
            let newDocument = new document({ ...fields, routes: fieldsRoutes, document: dir });
            newDocument.save()
            .then(() => res.status(201).json({ message: 'Запись успешно добавлена' }))
            .catch(e => res.status(400).json({
                    message: `При добавление записи произошла ошибка:  + ${e.message}`
                })
            );
        });
    });
};

module.exports.postVote = (req, res) => {
    const document = mongoose.model('documents');
    document.findByIdAndUpdate(req.body._id, req.body)
    .then(() => res.status(201).json({ message: 'Запись успешно обновлена!' }))
    .catch(err => res.status(400).json({
            message: `При обновлении записи произошла ошибка:  + ${err.message}`
        })
    );
}