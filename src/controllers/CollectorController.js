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
const CollectorServices_1 = require("../services/CollectorServices");
const tokenUtils_1 = require("../utils/tokenUtils");
const AuthValidations_1 = require("../validations/collectorValidations/AuthValidations");
const servicesValidationSchema_1 = require("../validations/producerValidations/servicesValidationSchema");
const UserServices_1 = __importDefault(require("../services/UserServices"));
const catchAsync = require('../utils/catchAsync');
const userService = new UserServices_1.default();
const signUp = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, phoneNumber, name, serviceArea, address, wallet, } = yield AuthValidations_1.signupValidationSchema.validateAsync(req.body);
        const signUpData = {
            username,
            password,
            email,
            phoneNumber,
            name,
            serviceArea,
            address,
            wallet,
        };
        const newCollector = yield (0, CollectorServices_1.signUpCollector)(signUpData);
        return res.status(201).json(newCollector);
    }
    catch (error) {
        return res.status(500).json({ error: `Signup failed: ${error.message}` });
    }
}));
const loginCollector = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, } = yield AuthValidations_1.loginValidationSchema.validateAsync(req.body);
    const collector = yield (0, CollectorServices_1.login)({ username, password });
    if (collector) {
        const token = (0, tokenUtils_1.signToken)(collector.id);
        res.status(200).json({
            status: 'success',
            message: "You have successfully logged in",
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
const collectorWithdrawal = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { amount, accountNumber, bank_code, name, walletPin, } = yield servicesValidationSchema_1.withdrawalValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.makeWithdrawal)(name, accountNumber, bank_code, amount, collector, walletPin);
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
const collectorDeposit = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { amount, email, } = yield servicesValidationSchema_1.depositValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.makeDeposit)(amount, email);
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
const verifyCollDeposit = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { reference, walletPin } = yield servicesValidationSchema_1.verifyDepositValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.verifyCollectorDeposit)(reference, collector, walletPin);
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
const setPin = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { walletPin, } = yield servicesValidationSchema_1.setPinValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.setWalletPin)(walletPin, collector);
        if (!response) {
            throw new Error("An Error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Pin set successfully",
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
function checkCollectorIsProvided(req) {
    if (!req.collector) {
        throw new Error("No authorized user provided");
    }
    return req.collector;
}
const becomeAgentPermission = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const response = yield (0, CollectorServices_1.becomeAgent)(collector);
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
const addPicker = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { name, address, phoneNumber, serviceArea, } = yield servicesValidationSchema_1.addPickerValidationSchema.validateAsync(req.body);
        const pickerData = {
            name: name,
            address: address,
            phoneNumber: phoneNumber,
            serviceArea: serviceArea,
        };
        const picker = yield (0, CollectorServices_1.addPickerr)(pickerData, collector);
        if (!picker) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Picker Added Successfully",
            data: picker,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const deletePicker = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { phoneNumber, } = yield servicesValidationSchema_1.deletePickerValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.deletePickerr)(phoneNumber, collector);
        if (!response) {
            throw new Error(" An error occurred, try again");
        }
        res.status(200).json({
            status: 'success',
            message: "Picker deleted Successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const updatePicker = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { phoneNumber, name, address, serviceArea } = yield servicesValidationSchema_1.updatePickerValidationSchema.validateAsync(req.body);
        const pickerData = {
            name: name,
            address: address,
            phoneNumber: phoneNumber,
            serviceArea: serviceArea,
        };
        const picker = yield (0, CollectorServices_1.updatePickerr)(phoneNumber, pickerData, collector);
        if (!picker) {
            throw new Error(" An error occurred, try again");
        }
        res.status(200).json({
            status: 'success',
            message: "Picker Updated Successfully",
            data: picker,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const getWallet = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const wallet = yield (0, CollectorServices_1.getCollectorWallet)(collector);
        res.status(200).json({
            status: 'success',
            message: "wallet found",
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
const getAvailableWaste = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { location } = yield servicesValidationSchema_1.wasteAvailabilityValidationSchema.validateAsync(req.params.location);
        const listOfAvailableWastes = yield (0, CollectorServices_1.getWastes)(location);
        res.status(200).json({
            status: 'success',
            message: "all waste found",
            data: listOfAvailableWastes,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const getPickers = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { location } = yield servicesValidationSchema_1.getPickerValidationSchema.validateAsync(req.params.location);
        const listOfAllPicker = yield (0, CollectorServices_1.getAllPickers)(location);
        res.status(200).json({
            status: 'success',
            message: "all pickers list",
            data: listOfAllPicker,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const makePaymentC = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { receiverUsername, amount, walletPin, } = yield servicesValidationSchema_1.makePaymentValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.makePayment)(collector, receiverUsername, amount, walletPin);
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
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const findCollector = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { username, } = yield servicesValidationSchema_1.searchValidationSchema.validateAsync(req.params.username);
        const foundCollector = yield (0, CollectorServices_1.getCollector)(username);
        if (!foundCollector) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Collector found",
            data: foundCollector,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: `${error}`,
        });
    }
}));
const collectorPickers = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const foundCollector = yield (0, CollectorServices_1.getCollectorPickers)(collector);
        if (!foundCollector) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "Collector found",
            data: foundCollector,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: `${error}`,
        });
    }
}));
const forgotPassword = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, } = yield servicesValidationSchema_1.forgotPasswordValidationSchema.validateAsync(req.body);
        const response = yield userService.forgotPassword(email, "collector");
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
const checkUsername = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield userService.checkUsername('collector');
    if (!response) {
        throw new Error(" An error occurred");
    }
    res.status(200).json({
        status: 'success',
        message: response,
    });
}));
const resetPassword = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, email, newPassword, } = yield servicesValidationSchema_1.resetPasswordValidationSchema.validateAsync(req.body);
    const response = yield userService.resetPassword(email, token, newPassword, 'collector');
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
        const collector = checkCollectorIsProvided(req);
        const { oldPin, newPin, } = yield servicesValidationSchema_1.updatePickerValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.updateControllerWalletPin)(collector, oldPin, newPin);
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
        const collector = checkCollectorIsProvided(req);
        const response = yield (0, CollectorServices_1.forgotWalletPinCollector)(collector);
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
        const collector = checkCollectorIsProvided(req);
        const { token, newPin, } = yield servicesValidationSchema_1.resetWalletPinValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.resetWalletPinCollector)(collector, token, newPin);
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
module.exports = {
    signUp,
    loginCollector,
    collectorDeposit,
    collectorWithdrawal,
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
    getPickers,
    collectorPickers,
    forgotPassword,
    checkUsername,
    resetPassword,
    updateWalletPin,
    forgotWalletPin,
    resetWalletPin,
};
