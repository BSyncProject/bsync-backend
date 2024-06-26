const {collectorAuth} = require('../middleware/collectorAuth');

const express = require('express');

const router = express.Router();
const {
  signUp, 
  loginCollector, 
  collectorWithdrawal,
  collectorDeposit,
  verifyCollDeposit,
  becomeAgentPermission,
  addPicker,
  deletePicker,
  updatePicker,
  getWallet,
  getAvailableWaste,
  setPin,
  makePaymentC,
  findCollector,
  collectorPickers,
  forgotPassword,
  checkUsername,
  resetPassword,
  updateWalletPin,
  forgotWalletPin,
  resetWalletPin,
  getUser,

} = require('../controllers/CollectorController');


router.post('/signup', signUp);
router.post('/login', loginCollector);
router.post('/checkUsername', checkUsername);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.use(collectorAuth);
router.get("/getUser", getUser)
router.post('/withdrawal', collectorWithdrawal);
router.post('/deposit', collectorDeposit);
router.post('/verifyDeposit', verifyCollDeposit);
router.post('/become-agent', becomeAgentPermission);
router.post('/delete/picker', deletePicker);
router.post('/add/picker', addPicker);
router.post('/update/picker', updatePicker);
router.get('/wallet', getWallet );
router.get('/waste/:location', getAvailableWaste);
router.post('/transfer', makePaymentC);
router.post('/wallet/pin', setPin);
router.get('/find/:username', findCollector);
router.get('/all-pickers', collectorPickers);
router.post('/wallet/update-pin', updateWalletPin);
router.post('/wallet/resetPin', resetWalletPin);
router.post('wallet/forgotPin', forgotWalletPin);

module.exports = router;
