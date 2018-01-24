const express = require('express');
const router = express.Router();

const users = require('../controllers/users');
const documents = require('../controllers/documents');

router.get('/getPreviews/:token', documents.getPreviewsByToken);
router.get('/getDocument/:id', documents.getDocumentById);
router.post('/postVote', documents.postVote);
router.post('/postNewDocument', documents.addNewDocument);

router.get('/getAllUsers', users.getAllUsers);
router.get('/getCurrentUser', users.getCurrentUser);

module.exports = router;