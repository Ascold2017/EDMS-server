const express = require('express');
const router = express.Router();

const groups = require('../controllers/groups');
const documents = require('../controllers/documents');
const mailer = require('../controllers/mailer');
const index = require('../controllers/auth');
const jwt = require('jwt-simple');
const config = require('../../config');

const isAuth = (req, res, next) => {
    // если в сессии текущего пользователя есть пометка о том, что он является
    console.log(req.headers);
    if (req.headers['token'] === 'null') {
        console.log('no token');
        res.sendStatus(401);
    }
    else if (jwt.decode(req.headers['token'], config.token.secretKey).isAuth) {
      //то всё хорошо
      return next();
    }
    //если нет, то перебросить пользователя на главную страницу сайта
    // res.redirect("/");
  };

router.get('/getPreviews', isAuth, documents.getPreviewsByToken);
router.get('/getDocument/:id', isAuth, documents.getDocumentById);
router.get('/getMyDocument/:id', isAuth, documents.getMyDocumentById);
router.get('/getDocPresets', isAuth, documents.getPresets);
router.get('/getOurDocuments', isAuth, documents.getOurPreviews);
router.get('/getArchiveDocuments', isAuth, documents.getArchiveDocuments);

router.post('/postVote', isAuth, documents.postVote);
router.post('/postNewDocument', isAuth, documents.addNewDocument);
router.post('/createPreset', isAuth, documents.createPreset);
router.put('/postNewVersion', isAuth, documents.postNewVersion);

router.get('/getAllUsers', isAuth, groups.getAllUsers);
router.get('/getCurrentUser', isAuth, groups.getCurrentUser);
router.get('/getAllGroups', isAuth, groups.getAllGroups);
router.get('/getGroup/:token', isAuth, groups.getGroupByToken);

router.post('/createNewGroup', isAuth, groups.createGroup);
router.post('/createNewUser', isAuth, groups.createUser);

router.post('/mail', isAuth, mailer);

router.post('/signIn', index.signIn);
router.post('/registration', index.registration);
router.post('/logout', index.logout);

module.exports = router;