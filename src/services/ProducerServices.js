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
exports.getProducer = exports.getProducerWallet = exports.reportIssues = exports.makePayment = exports.setWalletPin = exports.makeWithdrawal = exports.verifyProducerDeposit = exports.makeDeposit = exports.deleteWaste = exports.postWaste = exports.login = exports.signUp = void 0;
const _ProducerRepository_1 = __importDefault(require("../repository/ ProducerRepository"));
const WalletRepository_1 = __importDefault(require("../repository/WalletRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const WasteRepository_1 = __importDefault(require("../repository/WasteRepository"));
const TransactionRepository_1 = __importDefault(require("../repository/TransactionRepository"));
const PaymentServices_1 = require("./PaymentServices");
const CollectorServices_1 = require("./CollectorServices");
const producerRepository = new _ProducerRepository_1.default();
const walletRepository = new WalletRepository_1.default();
const wasteRepository = new WasteRepository_1.default();
const transactionRepository = new TransactionRepository_1.default();
function signUp(signUpData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!signUpData.password || !signUpData.username || !signUpData.email) {
            throw new Error("An error occurred");
        }
        const existingProducer = yield producerRepository.check(signUpData.username, signUpData.email);
        if (existingProducer) {
            throw new Error('Username is already taken');
        }
        signUpData.password = yield encode(signUpData.password);
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
function encode(word) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        const salt = bcrypt_1.default.genSaltSync(saltRounds);
        const hashedWord = bcrypt_1.default.hashSync(word, salt);
        return hashedWord;
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
        const passwordsMatch = yield compare(loginData.password, foundProducer.password);
        if (!passwordsMatch) {
            throw new Error("Incorrect Password");
        }
        return foundProducer;
    });
}
exports.login = login;
const compare = (plainWord, hashedWord) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcrypt_1.default.compare(plainWord, hashedWord);
    }
    catch (error) {
        console.error('Error comparing:', error);
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
        if (amount <= 99) {
            throw new Error("Invalid Amount, Minimum amount is 100");
        }
        const depositResponse = yield (0, PaymentServices_1.deposit)(amount, email);
        if (!depositResponse.data) {
            throw new Error("An error occurred, Try again");
        }
        return depositResponse.data;
    });
}
exports.makeDeposit = makeDeposit;
function verifyProducerDeposit(reference, producer, walletPin) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, PaymentServices_1.verifyDeposit)(reference);
        if (!data.data || !(data.message == "Verification successful")) {
            throw new Error("Verification not successful");
        }
        const wallet = yield walletRepository.findOne(producer.username);
        if (!wallet) {
            throw new Error("Wallet not Found");
        }
        checkWalletPin(walletPin, wallet.pin);
        yield checkTransactionReference(reference);
        const transaction = yield createTransaction(producer.username, "BSYNC", reference, "Deposit", data.data.amount, data.data.paid_at);
        wallet.balance = wallet.balance + data.data.amount;
        wallet.transactionHistory.push((yield transaction));
        walletRepository.update(wallet._id, wallet);
        return data;
    });
}
exports.verifyProducerDeposit = verifyProducerDeposit;
function checkWalletPin(walletPin, hashedPin) {
    if (!(compare(walletPin, hashedPin))) {
        throw new Error("Wallet Pin incorrect");
    }
}
const checkTransactionReference = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transactionRepository.findOne(reference);
    if (transaction) {
        throw new Error("Transaction Already Verified");
    }
});
function createTransaction(sender, receiver, reference, type, amount, date) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionData = {
            sender: sender,
            type: type,
            receiver: receiver,
            amount: amount,
            reference: reference,
            comment: type,
            date: date,
        };
        const transaction = yield transactionRepository.create(transactionData);
        return transaction;
    });
}
function makeWithdrawal(name, accountNumber, bank_code, amount, producer, walletPin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!producer) {
                throw new Error("Producer is not provided");
            }
            if (amount <= 99) {
                throw new Error("Invalid Amount, Minimum amount is 100");
            }
            const wallet = yield walletRepository.findOne(producer.username);
            if (!wallet) {
                throw new Error('Producer does not have a wallet');
            }
            checkWalletPin(walletPin, wallet.pin);
            if (wallet.balance < amount) {
                throw new Error("Insufficient Balance");
            }
            const data = yield (0, PaymentServices_1.startWithdrawal)(name, accountNumber, bank_code, amount);
            const withdrawData = yield (0, PaymentServices_1.makeTransfer)(amount, data.recipient_code);
            console.log("i got here in make withdrawal");
            yield checkTransactionReference(withdrawData.data.reference);
            const transaction = yield createTransaction("Bsync", producer.username, withdrawData.data.reference, "Withdrawal", withdrawData.data.amount, withdrawData.data.create_at);
            console.log(" transaction created");
            wallet.balance = wallet.balance - withdrawData.data.amount;
            wallet.transactionHistory.push(transaction);
            walletRepository.update(wallet._id, wallet);
            return withdrawData;
        }
        catch (error) {
            throw new Error(`${error}`);
        }
    });
}
exports.makeWithdrawal = makeWithdrawal;
function setWalletPin(walletPin, producer) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(walletPin);
        const wallet = yield getProducerWallet(producer);
        wallet.pin = yield encode(walletPin);
        ;
        walletRepository.update(wallet._id, wallet);
        return wallet;
    });
}
exports.setWalletPin = setWalletPin;
function makePayment(producer, collectorUsername, amount, walletPin) {
    return __awaiter(this, void 0, void 0, function* () {
        if (amount <= 99) {
            throw new Error("Invalid Amount, Minimum amount is 100");
        }
        const collector = yield (0, CollectorServices_1.getCollector)(collectorUsername);
        const senderWallet = yield walletRepository.findOne(producer.username);
        const receiverWallet = yield walletRepository.findOne(collector.username);
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
function reportIssues(comment, type, date, provider) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.reportIssues = reportIssues;
function getProducerWallet(producer) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield walletRepository.findOne(producer.username);
        if (!wallet) {
            throw new Error("Wallet Not Found");
        }
        return wallet;
    });
}
exports.getProducerWallet = getProducerWallet;
function getProducer(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = yield producerRepository.findOne(username);
        if (!producer) {
            throw new Error("Producer not found");
        }
        return producer;
    });
}
exports.getProducer = getProducer;
