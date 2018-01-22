const express = require('express');
const router = express.Router();
const index = require('../controllers/index');

router.post('/sign-in', index.signIn);

router.post('/registration', index.registration);

module.exports = router;