const Joi = require('joi');

export const signupValidationSchema = Joi.object().keys({
    name: Joi.string().required().min(3),
    username: Joi.string().required().min(3),
    phoneNumber: Joi.string().required().min(8).max(14),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    serviceArea: Joi.string().required().min(4),
    address: Joi.string().required().min(4),
    pin: Joi.string().required().length(4),
});


export const loginValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
});