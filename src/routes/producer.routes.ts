
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
  getWallet,
  setPin,
  makePaymentP,
  findProducer,
  getAvailableWaste,
  getPickers
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
router.get('/wallet', getWallet);
router.post('/wallet/pin', setPin);
router.post('/transfer', makePaymentP);
router.get('/find/:username', findProducer);
router.get('/wastes/:location', getAvailableWaste);
router.get('/pickers', getPickers)


module.exports = router;