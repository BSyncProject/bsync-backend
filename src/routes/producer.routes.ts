
import express from 'express'
const router = express.Router();
const { 
  signUpProducer, 
  loginProducer, 
  postPWaste,
  deleteWastes,
  depositMoney,
  withdrawMoney,
  verifyDeposit,
  finalizeWithdrawal,
} = require('../controllers/ProducerController');

const {producerAuth} = require('../middleware/producerAuth');


router.post('/signup', signUpProducer);
router.post('/login', loginProducer);

router.use(producerAuth);
router.post('/waste', postPWaste);
router.post('/withdrawal', withdrawMoney);
router.post('/deposit', depositMoney);
router.post('/verifyDeposit', verifyDeposit);
router.delete('./delete', deleteWastes);
router.post('/finalize-withdrawal', finalizeWithdrawal);


module.exports = router;