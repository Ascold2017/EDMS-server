const express = require('express');
const router = express.Router();

const groups = require('../controllers/groups');
const documents = require('../controllers/documents');
const mailer = require('../controllers/mailer');

router.get('/getPreviews', documents.getPreviewsByToken);
router.get('/getDocument/:id', documents.getDocumentById);
router.get('/getDocPresets', documents.getPresets);
router.get('/getOurDocuments', documents.getOurPreviews);

router.post('/postVote', documents.postVote);
router.post('/postNewDocument', documents.addNewDocument);
router.post('/createPreset', documents.createPreset);

router.get('/getAllUsers', groups.getAllUsers);
router.get('/getCurrentUser', groups.getCurrentUser);
router.get('/getAllGroups', groups.getAllGroups);
router.get('/getGroup/:token', groups.getGroupByToken);

router.post('/createNewGroup', groups.createGroup);
router.post('/createNewUser', groups.createUser);

router.post('/mail', mailer);

module.exports = router;