const {collectorAuth} = require('../middleware/collectorAuth');

const express = require('express');

const router = express.Router();
const {
  signUp, 
  loginCollector, 
  collectorWithdrawal,
  collectorDeposit,
  verifyCollDeposit,

} = require('../controllers/CollectorController');


router.post('/signup', signUp);
router.post('/login', loginCollector);

router.use(collectorAuth);
router.post('/withdrawal', collectorWithdrawal);
router.post('/deposit', collectorDeposit);
router.post('/verifyDeposit', verifyCollDeposit);

module.exports = router;
