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
exports.login = exports.signUpCollector = void 0;
const CollectorRepository_1 = __importDefault(require("../repository/CollectorRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const WalletRepository_1 = __importDefault(require("../repository/WalletRepository"));
const collectorRepository = new CollectorRepository_1.default();
const walletRepository = new WalletRepository_1.default();
function signUpCollector(signUpData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!signUpData.password || !signUpData.username || !signUpData.email) {
            throw new Error("An error occurred");
        }
        const existingCollector = yield collectorRepository.check(signUpData.username, signUpData.email);
        if (existingCollector) {
            throw new Error('Username is already taken');
        }
        signUpData.password = yield encodePassword(signUpData.password);
        signUpData.wallet = yield createNewWallet(signUpData.username);
        const newCollector = yield collectorRepository.create(signUpData);
        return newCollector;
    });
}
exports.signUpCollector = signUpCollector;
function createNewWallet(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletData = {
            owner: username,
            balance: 0
        };
        const newWallet = yield walletRepository.create(walletData);
        return newWallet;
    });
}
function encodePassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        return hashedPassword;
    });
}
function login(loginData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!loginData.password || !loginData.username) {
            throw new Error("username or password not provided");
        }
        const foundCollector = yield collectorRepository.findOne(loginData.username);
        if (!foundCollector) {
            throw new Error("User Not found");
        }
        const passwordsMatch = yield comparePasswords(loginData.password, foundCollector.password);
        if (!passwordsMatch) {
            throw new Error("Incorrect Password");
        }
        return foundCollector;
    });
}
exports.login = login;
const comparePasswords = (plainPassword, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcrypt_1.default.compare(plainPassword, hashedPassword);
    }
    catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
});