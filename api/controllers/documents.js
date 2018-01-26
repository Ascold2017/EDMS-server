const mongoose = require('mongoose');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

module.exports.getPreviewsByToken = (req, res) => {
    const documents = mongoose.model('documents');
    console.log('Token: ', req.params.token);
    documents.find({ token: req.params.token }, { document: 0 })
        .then(items => res.status(201).json(items))
        .catch(e => { console.error(e); res.status(404).json({}); });
};

module.exports.getDocumentById = (req, res) => {
    const documents = mongoose.model('documents');

    documents.findById(req.params.id)
        .then(item => {
            if (!item) { throw new Error('Документ не найден'); return; }
            res.status(201).json(item);
        })
        .catch(e => res.status(404).json({
            message: `Произошла ошибка:  + ${e.message}`
        }));
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
    form.parse(req, function (err, fields, files) {
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
            let dir = 'http://localhost:3000/upload/' + files.file.name;//.substr(fileName.indexOf('//'));
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
    console.log(req.body);
    // if (req.body.token exist && req.body.author exist) todo

    document.findById(req.body.id)
        .then((doc) => {
            // find author of vote in routes
            let author = doc.routes.find(route => route.author === req.body.author.author)
            if(!author || doc.routes.find(route => route.author === author)) {
                // if author not exist
                res.status(400).json({ message: 'Вы не можете проголосовать!' });
            }
            if(author.status !== 'waiting') {
                // if author not exist
                res.status(400).json({ message: 'Вы уже проголосовали!' });
            }
            // set changes for author
            author.status = req.body.vote;
            author.comment = req.body.comment;
            const updated = {
                ...doc,
                routes: doc.routes.map(route => route._id === author._id ? author : route),
                state: doc.state + 1,
            };
            // save changes
            doc.save()
                .then(() => {
                    res.status(201).json({ message: 'Голос зачтен!' });
                })
                .catch(err => res.status(400).json({
                        message: `При обновлении записи произошла ошибка:  + ${err.message}`
                    })
                );
        });
}