"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchValidationSchema = exports.makePaymentValidationSchema = exports.setPinValidationSchema = exports.getPickerValidationSchema = exports.wasteAvailabilityValidationSchema = exports.finalizeWithdrawalValidationSchema = exports.updatePickerValidationSchema = exports.deletePickerValidationSchema = exports.addPickerValidationSchema = exports.verifyDepositValidationSchema = exports.depositValidationSchema = exports.deleteWasteValidationSchema = exports.withdrawalValidationSchema = exports.postWasteValidationSchema = void 0;
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
    walletPin: Joi.string().required(),
});
exports.deleteWasteValidationSchema = Joi.object().keys({
    waste_id: Joi.string().required(),
});
exports.depositValidationSchema = Joi.object().keys({
    email: Joi.string().required(),
    amount: Joi.number().required(),
});
exports.verifyDepositValidationSchema = Joi.object().keys({
    reference: Joi.string().required(),
    walletPin: Joi.string().required()
});
exports.addPickerValidationSchema = Joi.object().keys({
    name: Joi.string().required().min(3),
    phoneNumber: Joi.string().required().min(8).max(14),
    address: Joi.string().required(),
    serviceArea: Joi.string().required(),
});
exports.deletePickerValidationSchema = Joi.object().keys({
    phoneNumber: Joi.string().required().min(8).max(14),
});
exports.updatePickerValidationSchema = Joi.object().keys({
    phoneNumber: Joi.string().required().min(8).max(14),
    name: Joi.string()
});
exports.finalizeWithdrawalValidationSchema = Joi.object().keys({
    otp: Joi.string().required(),
    transfer_code: Joi.string().required()
});
exports.wasteAvailabilityValidationSchema = Joi.object().keys({
    location: Joi.string().required(),
});
exports.getPickerValidationSchema = Joi.object().keys({
    location: Joi.string().required(),
});
exports.setPinValidationSchema = Joi.object().keys({
    walletPin: Joi.string().required().length(4),
});
exports.makePaymentValidationSchema = Joi.object().keys({
    receiverUsername: Joi.string().required(),
    walletPin: Joi.string().required(),
    amount: Joi.number().required(),
});
exports.searchValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
});
