const express = require('express');
const router = express.Router();
const index = require('../controllers/index');

router.get('/', (req, res) => {
    console.log('get index');
    res.render('pages/index', {});
})
router.post('/sign-in', index.signIn);

router.post('/registration', index.registration);

module.exports = router;