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
const Collector_1 = require("../models/Collector");
const Producer_1 = require("../models/Producer");
const EmailServices_1 = __importDefault(require("./EmailServices"));
const TokenServices_1 = __importDefault(require("./TokenServices"));
const tokenService = new TokenServices_1.default();
const emailService = new EmailServices_1.default();
class UserService {
    checkUsername(username, role) {
        return __awaiter(this, void 0, void 0, function* () {
            let foundUser;
            if (role === 'collector') {
                foundUser = yield Collector_1.CollectorModel.findOne({ username: username });
            }
            else {
                foundUser = yield Producer_1.ProducerModel.findOne({ username: username });
            }
            if (foundUser) {
                return "Username already taken";
            }
            else {
                return "Username Confirmed and can be used";
            }
        });
    }
    forgotPassword(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield findUserByEmail(role, email);
            if (!foundUser) {
                throw new Error("User not found");
            }
            const token = yield tokenService.generateToken();
            const emailResponse = emailService.forgotPassword(email, foundUser.name, token);
            const createdToken = yield tokenService.addToken(token, email);
            return emailResponse;
        });
    }
    resetPassword(email, token, newPassword, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenResponse = yield tokenService.checkToken(token, email);
            if (tokenResponse !== true) {
                throw new Error("Invalid Token");
            }
            ;
            const foundUser = yield findUserByEmail(role, email);
            if (!foundUser) {
                throw new Error("User not found");
            }
            foundUser.password = newPassword;
            if (role === "collector") {
                Collector_1.CollectorModel.updateOne(foundUser.id, foundUser);
            }
            else {
                Producer_1.ProducerModel.updateOne(foundUser.id, foundUser);
            }
            return "successful";
        });
    }
}
function findUserByEmail(role, email) {
    return __awaiter(this, void 0, void 0, function* () {
        let foundUser;
        if (role === 'collector') {
            foundUser = yield Collector_1.CollectorModel.findOne({ email: email });
        }
        else {
            foundUser = yield Producer_1.ProducerModel.findOne({ email: email });
        }
        return foundUser;
    });
}
exports.default = UserService;
