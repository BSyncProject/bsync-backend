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
exports.getCollectorPickers = exports.getAllPickers = exports.getCollector = exports.getWastes = exports.updatePickerr = exports.deletePickerr = exports.addPickerr = exports.becomeAgent = exports.setWalletPin = exports.getCollectorWallet = exports.makePayment = exports.makeWithdrawal = exports.verifyCollectorDeposit = exports.makeDeposit = exports.login = exports.signUpCollector = void 0;
const CollectorRepository_1 = __importDefault(require("../repository/CollectorRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const WalletRepository_1 = __importDefault(require("../repository/WalletRepository"));
const PickerServices_1 = __importDefault(require("../services/PickerServices"));
const PaymentServices_1 = require("./PaymentServices");
const TransactionRepository_1 = __importDefault(require("../repository/TransactionRepository"));
const WasteRepository_1 = __importDefault(require("../repository/WasteRepository"));
const ProducerServices_1 = require("./ProducerServices");
const EmailServices_1 = __importDefault(require("./EmailServices"));
const collectorRepository = new CollectorRepository_1.default();
const walletRepository = new WalletRepository_1.default();
const pickerServices = new PickerServices_1.default();
const transactionRepository = new TransactionRepository_1.default();
const wasteRepository = new WasteRepository_1.default();
const emailService = new EmailServices_1.default();
function signUpCollector(signUpData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!signUpData.password || !signUpData.username || !signUpData.email) {
            throw new Error("Incomplete Details");
        }
        const existingCollector = yield collectorRepository.check(signUpData.username, signUpData.email);
        if (existingCollector) {
            throw new Error('Username is already taken');
        }
        signUpData.password = yield encode(signUpData.password);
        signUpData.wallet = yield createNewWallet(signUpData.username);
        const newCollector = yield collectorRepository.create(signUpData);
        emailService.sendNewAccountEmail(newCollector.email, newCollector.name);
        return newCollector;
    });
}
exports.signUpCollector = signUpCollector;
function createNewWallet(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletData = {
            owner: username,
            balance: 0,
            pin: "null",
        };
        const newWallet = yield walletRepository.create(walletData);
        return newWallet;
    });
}
function encode(password) {
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
        const passwordsMatch = yield compare(loginData.password, foundCollector.password);
        if (!passwordsMatch) {
            throw new Error("Incorrect Password");
        }
        return foundCollector;
    });
}
exports.login = login;
const compare = (plainPassword, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcrypt_1.default.compare(plainPassword, hashedPassword);
    }
    catch (error) {
        console.error('Error comparing:', error);
        return false;
    }
});
function makeDeposit(amount, email) {
    return __awaiter(this, void 0, void 0, function* () {
        if (amount <= 99) {
            throw new Error("Invalid Amount, Minimum amount is 100");
        }
        const depositResponse = yield (0, PaymentServices_1.deposit)(amount, email);
        if (!depositResponse.data) {
            throw new Error("An error occurred, Try again later");
        }
        return depositResponse.data;
    });
}
exports.makeDeposit = makeDeposit;
function verifyCollectorDeposit(reference, collector, walletPin) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, PaymentServices_1.verifyDeposit)(reference);
        if (!data.data || !(data.message == "Verification successful")) {
            throw new Error("Verification not successful");
        }
        const wallet = yield walletRepository.findOne(collector.username);
        if (!wallet) {
            throw new Error("Wallet not Found");
        }
        checkWalletPin(walletPin, wallet.pin);
        yield checkTransactionReference(reference);
        const transaction = yield createTransaction(collector.username, "BSYNC", reference, "Deposit", data.data.amount / 100, data.data.paid_at);
        wallet.balance = wallet.balance += (data.data.amount / 100);
        wallet.transactionHistory.push(transaction);
        walletRepository.update(wallet._id, wallet);
        return data;
    });
}
exports.verifyCollectorDeposit = verifyCollectorDeposit;
function makeWithdrawal(name, accountNumber, bank_code, amount, collector, walletPin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!collector) {
                throw new Error("Collector not provided");
            }
            if (amount <= 99) {
                throw new Error("Invalid Amount, Minimum amount is 100");
            }
            const wallet = yield walletRepository.findOne(collector.username);
            if (!wallet) {
                throw new Error('Collector does not have a wallet');
            }
            yield checkWalletPin(walletPin, wallet.pin);
            if (wallet.balance < amount) {
                throw new Error("Insufficient Fund");
            }
            const data = yield (0, PaymentServices_1.startWithdrawal)(name, accountNumber, bank_code, amount);
            const withdrawData = yield (0, PaymentServices_1.makeTransfer)(amount, data.recipient_code);
            yield checkTransactionReference(withdrawData.data.reference);
            if (!withdrawData) {
                throw new Error("An Error occurred");
            }
            yield checkTransactionReference(withdrawData.data.reference);
            const transaction = createTransaction("Bsync", collector.username, withdrawData.data.reference, "Withdrawal", withdrawData.data.amount / 100, withdrawData.data.createdAt);
            wallet.balance = wallet.balance - (withdrawData.data.amount / 100);
            wallet.transactionHistory.push((yield transaction));
            walletRepository.update(wallet._id, wallet);
            return withdrawData;
        }
        catch (error) {
            throw new Error(`${error}`);
        }
    });
}
exports.makeWithdrawal = makeWithdrawal;
const checkTransactionReference = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transactionRepository.findOne(reference);
    if (transaction) {
        throw new Error("Transaction Already Verified");
    }
});
function createTransaction(sender, receiver, reference, type, amount, date) {
    const transactionData = {
        sender: sender,
        type: type,
        receiver: receiver,
        amount: amount,
        reference: reference,
        comment: type,
        date: date,
    };
    const transaction = transactionRepository.create(transactionData);
    return transaction;
}
function makePayment(collector, producerUsername, amount, walletPin) {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = yield (0, ProducerServices_1.getProducer)(producerUsername);
        const senderWallet = yield walletRepository.findOne(collector.username);
        const receiverWallet = yield walletRepository.findOne(producer.username);
        if (!senderWallet || !receiverWallet) {
            throw new Error('Wallet not found');
        }
        checkWalletPin(walletPin, senderWallet.pin);
        if (senderWallet.balance < amount) {
            throw new Error('Insufficient Balance');
        }
        senderWallet.balance = senderWallet.balance - amount;
        receiverWallet.balance = receiverWallet.balance + amount;
        const senderTransaction = yield createTransaction(collector.username, producer.username, `${Date.now()}`, "Debit", amount, String(Date.now()));
        senderWallet.transactionHistory.push(senderTransaction);
        const receiverTransaction = yield createTransaction(collector.username, producer.username, `${Date.now()}`, "Credit", amount, String(Date.now()));
        receiverWallet.transactionHistory.push(receiverTransaction);
        walletRepository.update(senderWallet._id, senderWallet);
        walletRepository.update(receiverWallet._id, receiverWallet);
        return "Successful";
    });
}
exports.makePayment = makePayment;
function checkWalletPin(walletPin, hashedPin) {
    if (!(compare(walletPin, hashedPin))) {
        throw new Error("Wallet Pin incorrect");
    }
}
function getCollectorWallet(collector) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield walletRepository.findOne(collector.username);
        if (!wallet) {
            throw new Error("Wallet Not Found");
        }
        return wallet;
    });
}
exports.getCollectorWallet = getCollectorWallet;
function setWalletPin(walletPin, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield getCollectorWallet(collector);
        if (wallet.pin) {
            throw new Error("Failed!, Wallet Pin already set");
        }
        wallet.pin = yield encode(walletPin);
        walletRepository.update(wallet._id, wallet);
        return wallet;
    });
}
exports.setWalletPin = setWalletPin;
function becomeAgent(collector) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!collector) {
            throw new Error("Collector not Provided");
        }
        collector.isAgent = true;
        yield collectorRepository.update(collector._id, collector);
        return 'Collector is now an Agent';
    });
}
exports.becomeAgent = becomeAgent;
function addPickerr(pickerData, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        yield collectIsAgent(collector);
        pickerData.collector = collector;
        const picker = yield pickerServices.addPicker(pickerData);
        return picker;
    });
}
exports.addPickerr = addPickerr;
function collectIsAgent(collector) {
    if (!collector.isAgent) {
        throw new Error("Collector cannot perform this action, become an agent");
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
        if (!resolvedPicker.collector._id.equals(collector._id)) {
            throw new Error("Collector is not authorized");
        }
    });
}
function getWastes(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const wastes = yield wasteRepository.findWastesWithAddress(location);
        if (!wastes) {
            throw new Error("No waste found");
        }
        return wastes;
    });
}
exports.getWastes = getWastes;
function getCollector(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const collector = yield collectorRepository.findOne(username);
        if (!collector) {
            throw new Error("Producer not found");
        }
        return collector;
    });
}
exports.getCollector = getCollector;
function getAllPickers(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const picker = yield pickerServices.findByServiceArea(location);
        return picker;
    });
}
exports.getAllPickers = getAllPickers;
function getCollectorPickers(collector) {
    return __awaiter(this, void 0, void 0, function* () {
        const pickers = yield pickerServices.findByCollector(collector);
        return pickers;
    });
}
exports.getCollectorPickers = getCollectorPickers;
