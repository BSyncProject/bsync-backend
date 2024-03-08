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
const Token_1 = require("../models/Token");
const uuid_1 = require("uuid");
class TokenService {
    addToken(token, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdAt = Date.now();
            yield Token_1.TokenModel.create({ value: token, createdAt: createdAt, createdFor: email });
        });
    }
    checkToken(token, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingToken = yield Token_1.TokenModel.findOneAndDelete({ value: token, createdFor: email });
            if (existingToken) {
                const now = Date.now();
                if (now - existingToken.createdAt <= 180000) {
                    Token_1.TokenModel.deleteOne({ value: existingToken.value });
                    return true;
                }
            }
            return false;
        });
    }
    generateToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const uuid = (0, uuid_1.v4)().substr(0, 4);
            const token = parseInt(uuid, 16).toString().padStart(4, '0');
            return token;
        });
    }
}
exports.default = TokenService;
