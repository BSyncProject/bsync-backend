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
const ProducerServices_1 = require("../services/ProducerServices");
const tokenUtils_1 = require("../utils/tokenUtils");
const AuthValidations_1 = require("../validations/producerValidations/AuthValidations");
const servicesValidationSchema_1 = require("../validations/producerValidations/servicesValidationSchema");
const catchAsync = require('../utils/catchAsync');
const signUpProducer = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, phoneNumber, name, address, wallet } = yield AuthValidations_1.signupProducerValidationSchema.validateAsync(req.body);
        const signUpData = {
            username,
            password,
            email,
            phoneNumber,
            name,
            address,
            wallet
        };
        const newProducer = yield (0, ProducerServices_1.signUp)(signUpData);
        return res.status(201).json(newProducer);
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
        res.status(error.status).json({
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
        res.status(error.status).json({
            status: 'failed',
            message: 'An error occurred: ' + `${error}`,
        });
    }
}));
const withdrawMoney = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        checkProducerIsProvided(req);
        const { amount, accountNumber, bank_code, name, } = yield servicesValidationSchema_1.withdrawalValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.makeWithdrawal)(name, accountNumber, bank_code, amount, req.producer);
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
const depositMoney = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { amount, email, } = yield servicesValidationSchema_1.depositValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.makeDeposit)(amount, email);
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
const verifyDeposit = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producer = checkProducerIsProvided(req);
        const { reference, } = yield servicesValidationSchema_1.depositValidationSchema.validateAsync(req.body);
        const response = yield (0, ProducerServices_1.verifyProducerDeposit)(reference, producer);
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
function checkProducerIsProvided(req) {
    if (!req.producer) {
        throw new Error("User not Authorized");
    }
    return req.producer;
}
module.exports = {
    signUpProducer,
    loginProducer,
    postPWaste,
    deleteWastes,
    withdrawMoney, //See adeola at palace, ask samuel sola.
    depositMoney,
    verifyDeposit,
};
