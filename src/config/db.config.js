"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_URL = void 0;
exports.DATABASE_URL = process.env.DATABASE_URI || 'mongodb://localhost:27017/TestDBsync';
