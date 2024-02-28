"use strict";
const express = require('express');
const router = express.Router();
const { signUp, loginCollector } = require('../controllers/CollectorController');
router.post('/signup', signUp);
router.post('/login', loginCollector);
module.exports = router;
