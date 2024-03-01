"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePickerValidationSchema = exports.addPickerValidationSchema = exports.depositValidationSchema = exports.deleteWasteValidationSchema = exports.withdrawalValidationSchema = exports.postWasteValidationSchema = void 0;
const Joi = require('joi');
exports.postWasteValidationSchema = Joi.object().keys({
    quantity: Joi.string().required(),
    location: Joi.string().required(),
    imageLink: Joi.string(),
    majority: Joi.string().required(),
});
exports.withdrawalValidationSchema = Joi.object().keys({
    amount: Joi.number().required(),
    accountNumber: Joi.string().required(),
    name: Joi.string().required(),
    bank_code: Joi.string().required(),
});
exports.deleteWasteValidationSchema = Joi.object().keys({
    waste_id: Joi.string().required(),
});
exports.depositValidationSchema = Joi.object().keys({
    amount: Joi.number().required(),
    accountNumber: Joi.string().required(),
    name: Joi.string().required(),
    bank_code: Joi.string().required(),
});
exports.addPickerValidationSchema = Joi.object().keys({
    name: Joi.number().required().min(3),
    phoneNumber: Joi.string().required().min(8).max(14),
    address: Joi.string().required(),
    serviceArea: Joi.string().required(),
});
exports.deletePickerValidationSchema = Joi.object().keys({
    phoneNumber: Joi.string().required().min(8).max(14),
});
