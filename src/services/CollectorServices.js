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
exports.updatePickerr = exports.deletePickerr = exports.addPickerr = exports.becomeAgent = exports.completeWithdrawal = exports.makeWithdrawal = exports.verifyCollectorDeposit = exports.makeDeposit = exports.login = exports.signUpCollector = void 0;
const CollectorRepository_1 = __importDefault(require("../repository/CollectorRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const WalletRepository_1 = __importDefault(require("../repository/WalletRepository"));
const PickerServices_1 = __importDefault(require("../services/PickerServices"));
const collectorRepository = new CollectorRepository_1.default();
const walletRepository = new WalletRepository_1.default();
const pickerServices = new PickerServices_1.default();
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
function verifyCollectorDeposit(reference, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield verifyDeposit(reference);
        if (!data.data && !(data.message == "Verification successful")) {
            const wallet = collector.wallet;
            wallet.balance = wallet.balance += data.data.amount;
            walletRepository.update(wallet._id, wallet);
        }
        return data;
    });
}
exports.verifyCollectorDeposit = verifyCollectorDeposit;
function makeWithdrawal(name, accountNumber, bank_code, amount, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        const withdrawData = yield startWithdrawal(name, accountNumber, bank_code, amount);
        if (collector) {
            const wallet = yield walletRepository.findOne(collector.username);
            if (!wallet) {
                throw new Error('An error occurred');
            }
            if (wallet.balance < amount) {
                throw new Error("Insufficient Fund");
            }
            wallet.balance = wallet.balance -= amount;
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
function becomeAgent(collector) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!collector) {
            throw new Error("Collector not Provided");
        }
        collector.isAgent = true;
        collectorRepository.update(collector._id, collector);
        return 'Collector is now an Agent';
    });
}
exports.becomeAgent = becomeAgent;
function addPickerr(pickerData, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        collectIsAgent(collector);
        pickerData.collector = collector;
        const picker = yield pickerServices.addPicker(pickerData);
        return picker;
    });
}
exports.addPickerr = addPickerr;
function collectIsAgent(collector) {
    if (!collector.isAgent) {
        throw new Error("Collector cannot Perform this action, become an agent");
    }
}
function deletePickerr(pickerNumber, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        collectIsAgent(collector);
        const foundPicker = pickerServices.findOne(pickerNumber);
        yield checkOwnerShip(foundPicker, collector);
        const response = yield pickerServices.deletePicker((yield foundPicker).id);
        return response;
    });
}
exports.deletePickerr = deletePickerr;
function updatePickerr(pickerNumber, pickerData, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        collectIsAgent(collector);
        const foundPicker = pickerServices.findOne(pickerNumber);
        yield checkOwnerShip(foundPicker, collector);
        const updatedPicker = pickerServices.updatePicker((yield foundPicker).id, pickerData);
        return updatedPicker;
    });
}
exports.updatePickerr = updatePickerr;
function checkOwnerShip(picker, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        let resolvedPicker;
        if (picker instanceof Promise) {
            resolvedPicker = yield picker;
        }
        else {
            resolvedPicker = picker;
        }
        if (resolvedPicker.collector === undefined) {
            throw new Error("Collector is not defined for the picker");
        }
        if (resolvedPicker.collector !== collector) {
            throw new Error("Collector is not authorized");
        }
    });
}
