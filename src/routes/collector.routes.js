"use strict";
const { collectorAuth } = require('../middleware/collectorAuth');
const express = require('express');
const router = express.Router();
const { signUp, loginCollector, collectorWithdrawal, collectorDeposit, verifyCollDeposit, becomeAgentPermission, addPicker, deletePicker, updatePicker, getWallet, getAvailableWaste, } = require('../controllers/CollectorController');
router.post('/signup', signUp);
router.post('/login', loginCollector);
router.use(collectorAuth);
router.post('/withdrawal', collectorWithdrawal);
router.post('/deposit', collectorDeposit);
router.post('/verifyDeposit', verifyCollDeposit);
router.post('/become-agent', becomeAgentPermission);
router.post('/delete/picker', deletePicker);
router.post('/add/picker', addPicker);
router.post('/update/picker', updatePicker);
router.get('/wallet', getWallet);
router.get('/waste/:location', getAvailableWaste);
module.exports = router;
