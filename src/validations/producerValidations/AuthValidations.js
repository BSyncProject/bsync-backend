"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginProducerValidationSchema = exports.signupProducerValidationSchema = void 0;
const Joi = require('joi');
exports.signupProducerValidationSchema = Joi.object().keys({
    name: Joi.string().required().min(3),
    username: Joi.string().required().min(3),
    phoneNumber: Joi.string().required().min(8).max(14),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    address: Joi.string().required().min(4),
    pin: Joi.string().required().length(4),
});
exports.loginProducerValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
});
