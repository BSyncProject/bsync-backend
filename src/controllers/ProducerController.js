"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProducerServices_1 = require("../services/ProducerServices");
const tokenUtils_1 = require("../utils/tokenUtils");
const AuthValidations_1 = require("../validations/producerValidations/AuthValidations");
const servicesValidationSchema_1 = require("../validations/producerValidations/servicesValidationSchema");
const UserServices_1 = __importDefault(require("../services/UserServices"));
const catchAsync = require('../utils/catchAsync');
const userService = new UserServices_1.default();
const signUpProducer = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, phoneNumber, name, address, wallet, pin, serviceArea, } = yield AuthValidations_1.signupProducerValidationSchema.validateAsync(req.body);
        const signUpData = {
            username,
            password,
            email,
            phoneNumber,
            name,
            address,
            wallet,
            serviceArea,
        };
        const newProducer = yield (0, ProducerServices_1.signUp)(signUpData, pin);
        const token = (0, tokenUtils_1.signToken)(newProducer.id);
        return res.status(201).json(Object.assign(Object.assign({}, newProducer), { token: token }));
    }
    catch (error) {
        return res.status(500).json({ error: `Signup failed: ${error.message}` });
    }
}));
const loginProducer = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, } = yield AuthValidations_1.loginProducerValidationSchema.validateAsync(req.body);
    const producer = yield (0, ProducerServices_1.login)({ username, password });
    if (producer) {
        const token = (0, tokenUtils_1.signToken)(producer.id);
        res.status(200).json({
            status: 'success',
            message: "You have successfully signed in",
            token,
        });
    }
    else {
        res.status(404).json({
            status: 'failed',
            message: 'Wrong credentials'
        });
    }
}));
const postPWaste = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.producer) {
            throw new Error("User not Authorized");
        }
        const { quantity, location, majority, imageLink, } = yield servicesValidationSchema_1.postWasteValidationSchema.validateAsync(req.body);
        const waste = yield (0, ProducerServices_1.postWaste)({ quantity, majority, location, imageLink }, req.producer);
        if (waste) {
            res.status(200).json({
                status: 'success',
                message: "waste post successfully",
                data: waste,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error.message}`
        });
    }
}));
const deleteWastes = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { waste_id, } = yield servicesValidationSchema_1.deleteWasteValidationSchema.validateAsync(req.body);
        const waste = yield (0, ProducerServices_1.deleteWaste)(waste_id, producer);
        if (waste) {
            res.status(200).json({
                status: 'success',
                message: waste,
            });
        }
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const withdrawMoney = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        checkProducerIsProvided(req);
        const { amount, accountNumber, bank_code, name, walletPin, } = yield servicesValidationSchema_1.withdrawalValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.makeWithdrawal)(name, accountNumber, bank_code, amount, req.producer, walletPin);
        if (!response) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "withdrawal Successful",
            data: response,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const depositMoney = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { amount, } = yield servicesValidationSchema_1.depositValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.makeDeposit)(amount, producer.email);
        if (!response) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: response,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const verifyDeposit = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { reference, amount, } = yield servicesValidationSchema_1.verifyDepositValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.verifyProducerDeposit)(amount, reference, producer);
        if (!response) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'Deposit successful',
            message: response,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
function checkProducerIsProvided(req) {
    if (!req.producer) {
        throw new Error("User not Authorized");
    }
    return req.producer;
}
const getWallet = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const wallet = yield (0, ProducerServices_1.getProducerWallet)(producer);
        res.status(200).json({
            status: 'success',
            message: "Wallet found",
            data: wallet,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const setPin = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { walletPin } = yield servicesValidationSchema_1.setPinValidationSchema.validateAsync(req.body);
        const wallet = yield (0, ProducerServices_1.setWalletPin)(walletPin, producer);
        res.status(200).json({
            status: 'success',
            message: "Wallet pin set successfully",
            data: wallet,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const makePaymentP = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { receiverUsername, amount, walletPin, } = yield servicesValidationSchema_1.makePaymentValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.makePayment)(producer, receiverUsername, amount, walletPin);
        if (!response) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Transfer Successful",
            data: response,
        });
    }
    catch (error) {
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const findProducer = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { username, } = yield servicesValidationSchema_1.searchValidationSchema.validateAsync(req.params.username);
        const foundProducer = yield (0, ProducerServices_1.getProducer)(username);
        if (!foundProducer) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Producer found",
            data: foundProducer,
        });
    }
    catch (error) {
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const getPickers = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { location, } = yield servicesValidationSchema_1.getPickerValidationSchema.validateAsync({ location: req.params.location });
        const foundPickers = yield (0, ProducerServices_1.getAllP)(location);
        if (!foundPickers) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Pickers found",
            data: foundPickers,
        });
    }
    catch (error) {
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const getWastes = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const foundPickers = yield (0, ProducerServices_1.getMyWastes)(producer);
        if (!foundPickers) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Pickers found",
            data: foundPickers,
        });
    }
    catch (error) {
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const checkUsername = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield userService.checkUsername('producer');
    if (!response) {
        throw new Error(" An error occurred");
    }
    res.status(200).json({
        status: 'success',
        message: response,
    });
}));
const forgotPassword = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, } = yield servicesValidationSchema_1.forgotPasswordValidationSchema.validateAsync(req.body);
        const response = yield userService.forgotPassword(email, "producer");
        if (!response) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Check your email for password reset otp",
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: `${error}`,
        });
    }
}));
const resetPassword = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, email, newPassword, } = yield servicesValidationSchema_1.resetPasswordValidationSchema.validateAsync(req.body);
    const response = yield userService.resetPassword(email, token, newPassword, 'producer');
    if (!response) {
        throw new Error(" An error occurred");
    }
    res.status(200).json({
        status: 'success',
        message: "Password reset successful",
    });
}));
const updateWalletPin = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { oldPin, newPin, } = yield servicesValidationSchema_1.updatePickerValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.updateProducerWalletPin)(producer, oldPin, newPin);
        if (!response) {
            throw new Error("An error occurred");
        }
        res.status(200).json({
            status: "success",
            message: response,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "failed",
            message: `${error.message}`,
        });
    }
}));
const forgotWalletPin = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const response = yield (0, ProducerServices_1.forgotWalletPinProducer)(producer);
        if (!response) {
            throw new Error("An error occurred");
        }
        res.status(200).json({
            status: "success",
            message: "Check your email for a wallet reset token",
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: `${error.message}`,
        });
    }
}));
const resetWalletPin = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { token, newPin, } = yield servicesValidationSchema_1.resetWalletPinValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.resetWalletPinProducer)(producer, token, newPin);
        if (!response) {
            throw new Error("An error occurred");
        }
        res.status(200).json({
            status: "success",
            message: response,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: `${error.message}`,
        });
    }
}));
const getUser = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        res.status(200).json(producer);
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: `${error.message}`,
        });
    }
}));
module.exports = {
    signUpProducer,
    loginProducer,
    postPWaste,
    deleteWastes,
    withdrawMoney,
    depositMoney,
    verifyDeposit,
    getWallet,
    setPin,
    makePaymentP,
    findProducer,
    getPickers,
    getWastes,
    forgotPassword,
    checkUsername,
    resetPassword,
    updateWalletPin,
    resetWalletPin,
    forgotWalletPin,
    getUser,
};
