"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postWasteValidationSchema = void 0;
const Joi = require('joi');
exports.postWasteValidationSchema = Joi.object().keys({
    quantity: Joi.string().required(),
    location: Joi.string().required(),
    imageLink: Joi.string(),
    majority: Joi.string().required(),
});
