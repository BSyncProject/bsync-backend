"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const { signUpProducer, loginProducer, postPWaste, deleteWastes, depositMoney, withdrawMoney, verifyDeposit, finalizeWithdrawal, } = require('../controllers/ProducerController');
const { producerAuth } = require('../middleware/producerAuth');
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
