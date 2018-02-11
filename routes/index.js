const express = require('express');
const router = express.Router();
const index = require('../controllers/index');

router.get('/', (req, res) => {
    res.render('pages/index');
})
router.post('/sign-in', index.signIn);

router.post('/registration', index.registration);

router.post('/logout', index.logout);

module.exports = router;