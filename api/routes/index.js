const express = require('express');
const router = express.Router();

const groups = require('../controllers/groups/index')
const documents = require('../controllers/documents');
const mailer = require('../controllers/mailer');
const index = require('../controllers/auth');
const stat = require('../controllers/stat');
const jwt = require('jwt-simple');
const config = require('../../config');

const isAuth = (req, res, next) => {
  if (req.headers['token'] === 'null') {
    res.sendStatus(401);
  }
  else if (jwt.decode(req.headers['token'], config.token.secretKey).isAuth) {
    return next();
  }
};

router.get('/getPreviews', isAuth, documents.getPreviews);
router.get('/getDocument/:id', isAuth, documents.getDocumentById);
router.get('/getMyDocument/:id', isAuth, documents.getMyDocumentById);
router.get('/getDocPresets', isAuth, documents.getPresets);
router.get('/getOurDocuments', isAuth, documents.getOurPreviews);
router.get('/getArchiveDocuments', isAuth, documents.getArchievePreviews);
router.get('/getArchiveDocument/:id', isAuth, documents.getArchieveDocument);

router.post('/postVote', isAuth, documents.postSign);
router.post('/postNewDocument', isAuth, documents.addNewDocument);
router.post('/createPreset', isAuth, documents.createPreset);
router.put('/postNewVersion', isAuth, documents.addNewVersion);
router.post('/closeDocument', isAuth, documents.closeDocument);

router.get('/getAllUsers', isAuth, groups.getAllUsers);
router.get('/getCurrentUser', isAuth, groups.getCurrentUser);
router.get('/getAllGroups', isAuth, groups.getAllGroups);
router.get('/getGroup/:token', isAuth, groups.getGroupByToken);

router.post('/createNewGroup', isAuth, groups.createGroup);
router.post('/createNewAdmin', isAuth, groups.createAdmin);
router.delete('/removeAdmin/:groupId/:adminId', isAuth, groups.deleteAdmin);
router.post('/createNewUser', isAuth, groups.createUser);
router.post('/sendInviteAdmin', isAuth, groups.sendInviteAdmin);

router.post('/mail', isAuth, (req, res) => {
  mailer(req.body)
    .then(response => res.status(200).json(response))
    .catch(e => res.status(400).json(e))
});

router.post('/signIn', index.signIn)
router.post('/signInAdmin', index.signInAdmin)
router.post('/logout', index.logout)

router.get('/getDocsStat', stat.getDocsStat)

router.get('/checkSigns/:id', documents.checkSigns)

module.exports = router;