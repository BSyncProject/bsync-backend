
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
  getWastes,
  getPickers,
  checkUsername,
  forgotPassword,
  resetPassword,
  updateWalletPin,
  resetWalletPin,
  forgotWalletPin,
  getUser,
  markSold,

} = require('../controllers/ProducerController');

const {producerAuth} = require('../middleware/producerAuth');


router.post('/signup', signUpProducer);
router.post('/login', loginProducer);
router.post('/checkUsername', checkUsername);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.use(producerAuth);
router.get("/getUser", getUser)
router.post('/waste', postPWaste);
router.post('/withdrawal', withdrawMoney);
router.post('/deposit', depositMoney);
router.post('/verifyDeposit', verifyDeposit);
router.delete('./delete', deleteWastes);
router.get('/wallet', getWallet);
router.post('/wallet/pin', setPin);
router.post('/transfer', makePaymentP);
router.get('/find/:username', findProducer);
router.get('/waste', getWastes);
router.get('/pickers/:location', getPickers);
router.post('/wallet/update', updateWalletPin);
router.post('/wallet/resetPin', resetWalletPin);
router.post('wallet/forgotPin', forgotWalletPin);
router.post('/sold', markSold);


module.exports = router;