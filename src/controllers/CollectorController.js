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
Object.defineProperty(exports, "__esModule", { value: true });
const CollectorServices_1 = require("../services/CollectorServices");
const tokenUtils_1 = require("../utils/tokenUtils");
const AuthValidations_1 = require("../validations/collectorValidations/AuthValidations");
const servicesValidationSchema_1 = require("../validations/producerValidations/servicesValidationSchema");
const catchAsync = require('../utils/catchAsync');
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
        const { amount, accountNumber, bank_code, name, } = yield servicesValidationSchema_1.withdrawalValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.makeWithdrawal)(name, accountNumber, bank_code, amount, collector);
        if (!response) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: "withdrawal in queue",
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
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const verifyCollDeposit = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { reference, } = yield servicesValidationSchema_1.depositValidationSchema.validateAsync(req.body);
        const response = yield (0, CollectorServices_1.verifyCollectorDeposit)(reference, collector);
        if (!response) {
            throw new Error(" An error occurred");
        }
        res.status(200).json({
            status: 'success',
            message: response,
        });
    }
    catch (error) {
        res.status(error.status).json({
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
        res.status(error.status).json({
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
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const deletePicker = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collector = checkCollectorIsProvided(req);
        const { phoneNumber, } = yield servicesValidationSchema_1.deletePickerValidationSchema.validateAsync(req.body);
        const picker = yield (0, CollectorServices_1.deletePickerr)(phoneNumber, collector);
        if (!picker) {
            throw new Error(" An error occurred, try again");
        }
        res.status(200).json({
            status: 'success',
            message: "Picker deleted Successfully",
        });
    }
    catch (error) {
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
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
};
