"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidationSchema = exports.signupValidationSchema = void 0;
const Joi = require('joi');
exports.signupValidationSchema = Joi.object().keys({
    name: Joi.string().required().min(5),
    username: Joi.string().required().min(5),
    phoneNumber: Joi.string().required().min(8).max(14),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    serviceArea: Joi.string().required().min(4),
    address: Joi.string().required().min(4),
});
exports.loginValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
});
