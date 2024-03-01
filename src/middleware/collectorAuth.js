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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CollectorRepository_1 = __importDefault(require("../repository/CollectorRepository"));
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const collectorRepository = new CollectorRepository_1.default();
const collectorAuth = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({
            status: 'failed',
            message: 'You are not Authorized!'
        });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            status: 'failed',
            message: 'You are not Authorized!'
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id } = decoded;
        const collector = yield collectorRepository.getById(id);
        if (!collector) {
            return res.status(404).json({
                status: 'failed',
                message: 'Collector Account does not exist!',
            });
        }
        req.collector = collector;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                status: 'expired',
                message: 'Session ended',
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
}));
exports.default = collectorAuth;
module.exports = {
    collectorAuth,
};
