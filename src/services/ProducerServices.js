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
exports.reportIssues = exports.completeWithdrawal = exports.makeWithdrawal = exports.verifyProducerDeposit = exports.makeDeposit = exports.deleteWaste = exports.postWaste = exports.login = exports.signUp = void 0;
const _ProducerRepository_1 = __importDefault(require("../repository/ ProducerRepository"));
const WalletRepository_1 = __importDefault(require("../repository/WalletRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const WasteRepository_1 = __importDefault(require("../repository/WasteRepository"));
const producerRepository = new _ProducerRepository_1.default();
const walletRepository = new WalletRepository_1.default();
const wasteRepository = new WasteRepository_1.default();
function signUp(signUpData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!signUpData.password || !signUpData.username || !signUpData.email) {
            throw new Error("An error occurred");
        }
        const existingProducer = yield producerRepository.check(signUpData.username, signUpData.email);
        if (existingProducer) {
            throw new Error('Username is already taken');
        }
        signUpData.password = yield encodePassword(signUpData.password);
        signUpData.wallet = yield createNewWallet(signUpData.username);
        const newProducer = yield producerRepository.create(signUpData);
        return newProducer;
    });
}
exports.signUp = signUp;
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
        const foundProducer = yield producerRepository.findOne(loginData.username);
        if (!foundProducer) {
            throw new Error("User Not found");
        }
        const passwordsMatch = yield comparePasswords(loginData.password, foundProducer.password);
        if (!passwordsMatch) {
            throw new Error("Incorrect Password");
        }
        return foundProducer;
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
function postWaste(wasteData, producer) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!producer) {
            throw new Error("Unknown User");
        }
        wasteData.producer = producer;
        wasteData.datePosted = new Date();
        const waste = yield wasteRepository.create(wasteData);
        return waste;
    });
}
exports.postWaste = postWaste;
function deleteWaste(waste_id, producer) {
    return __awaiter(this, void 0, void 0, function* () {
        const waste = yield wasteRepository.getById(waste_id);
        if ((waste === null || waste === void 0 ? void 0 : waste.producer) == producer) {
            wasteRepository.delete(waste._id);
            return "Waste deleted successfully";
        }
        throw new Error("Unauthorized");
    });
}
exports.deleteWaste = deleteWaste;
function makeDeposit(amount, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const depositResponse = yield deposit(amount, email);
        if (!depositResponse.data) {
            throw new Error("An error occurred, Try again later");
        }
        const { createdData } = depositResponse.data;
        return createdData;
    });
}
exports.makeDeposit = makeDeposit;
function verifyProducerDeposit(reference, producer) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield verifyDeposit(reference);
        if (!data.data && !(data.message == "Verification successful")) {
            const wallet = producer.wallet;
            wallet.balance = wallet.balance += data.data.amount;
            walletRepository.update(wallet._id, wallet);
        }
        return data;
    });
}
exports.verifyProducerDeposit = verifyProducerDeposit;
function makeWithdrawal(name, accountNumber, bank_code, amount, producer) {
    return __awaiter(this, void 0, void 0, function* () {
        let withdrawData;
        if (producer) {
            const wallet = yield walletRepository.findOne(producer.username);
            if (!wallet) {
                throw new Error('An error occurred');
            }
            if (wallet.balance < amount) {
                throw new Error("Insufficient Fund");
            }
            withdrawData = yield startWithdrawal(name, accountNumber, bank_code, amount);
            wallet.balance = wallet.balance -= (amount);
            walletRepository.update(wallet._id, wallet);
        }
        return withdrawData;
    });
}
exports.makeWithdrawal = makeWithdrawal;
function completeWithdrawal(otp, transfer_code) {
    return __awaiter(this, void 0, void 0, function* () {
        const completedData = finalizeTransfer(otp, transfer_code);
        return completedData;
    });
}
exports.completeWithdrawal = completeWithdrawal;
function reportIssues(comment, type, date, provider) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.reportIssues = reportIssues;
