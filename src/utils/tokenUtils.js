"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUserVerifyToken = exports.signUserToken = exports.signResetToken = exports.signVerifyToken = exports.signToken = void 0;
const jwt = require('jsonwebtoken');
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
exports.signToken = signToken;
const signVerifyToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_VERIFY_SECRET, {
        expiresIn: process.env.JWT_VERIFY_EXPIRE,
    });
};
exports.signVerifyToken = signVerifyToken;
const signResetToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_RESET_SECRET, {
        expiresIn: process.env.JWT_RESET_EXPIRE,
    });
};
exports.signResetToken = signResetToken;
const signUserToken = (phoneNumber, producer_id) => {
    return jwt.sign({ phoneNumber, producer_id }, process.env.JWT_USER_SECRET, {
        expiresIn: process.env.JWT_USER_EXPIRE,
    });
};
exports.signUserToken = signUserToken;
const signUserVerifyToken = (phoneNumber, producer_id) => {
    return jwt.sign({ phoneNumber, producer_id }, process.env.JWT_VERIFY_SECRET, {
        expiresIn: process.env.JWT_VERIFY_EXPIRE,
    });
};
exports.signUserVerifyToken = signUserVerifyToken;
