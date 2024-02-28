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
module.exports = {
    signUp,
    loginCollector,
};
