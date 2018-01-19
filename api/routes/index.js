const express = require('express');
const router = express.Router();

const users = require('../controllers/users');
const documents = require('../controllers/documents');

router.get('/getPreviews/:token', documents.getPreviewsByToken);
router.get('/getDocument/:id', documents.getDocumentById);
router.put('/postVote', documents.postVote);
router.post('/postNewDocument', documents.addNewDocument);

router.get('/getAllUsers', users.getAllUsers);

module.exports = router;