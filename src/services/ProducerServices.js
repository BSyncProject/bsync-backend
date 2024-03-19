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
exports.markWasteAsSold = exports.resetWalletPinProducer = exports.forgotWalletPinProducer = exports.updateProducerWalletPin = exports.getMyWastes = exports.getAllP = exports.getProducer = exports.getProducerWallet = exports.reportIssues = exports.makePayment = exports.setWalletPin = exports.makeWithdrawal = exports.verifyProducerDeposit = exports.makeDeposit = exports.deleteWaste = exports.postWaste = exports.login = exports.signUp = void 0;
const _ProducerRepository_1 = __importDefault(require("../repository/ ProducerRepository"));
const WalletRepository_1 = __importDefault(require("../repository/WalletRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const WasteRepository_1 = __importDefault(require("../repository/WasteRepository"));
const TransactionRepository_1 = __importDefault(require("../repository/TransactionRepository"));
const PaymentServices_1 = require("./PaymentServices");
const CollectorServices_1 = require("./CollectorServices");
const PickerRepository_1 = __importDefault(require("../repository/PickerRepository"));
const EmailServices_1 = __importDefault(require("./EmailServices"));
const TokenServices_1 = __importDefault(require("./TokenServices"));
const producerRepository = new _ProducerRepository_1.default();
const walletRepository = new WalletRepository_1.default();
const wasteRepository = new WasteRepository_1.default();
const transactionRepository = new TransactionRepository_1.default();
const pickerRepository = new PickerRepository_1.default();
const emailService = new EmailServices_1.default();
const tokenService = new TokenServices_1.default();
function signUp(signUpData, pin) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!signUpData.password || !signUpData.username || !signUpData.email) {
            throw new Error("An error occurred");
        }
        const existingProducer = yield producerRepository.check(signUpData.username, signUpData.email);
        if (existingProducer) {
            throw new Error('Username or email is already taken');
        }
        signUpData.password = yield encode(signUpData.password);
        signUpData.wallet = yield createNewWallet(signUpData.username, pin);
        const newProducer = yield producerRepository.create(signUpData);
        const response = yield emailService.sendNewAccountEmail(newProducer.email, newProducer.name);
        return newProducer;
    });
}
exports.signUp = signUp;
function createNewWallet(username, pin) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPin = yield encode(pin);
        const walletData = {
            owner: username,
            balance: 0,
            pin: hashedPin,
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
function verifyProducerDeposit(amount, reference, producer) {
    return __awaiter(this, void 0, void 0, function* () {
        // const data = await verifyDeposit(amount);
        // if (!data.data || !(data.message == "Verification successful")){
        //   throw new Error("Verification not successful");
        // }
        const wallet = yield walletRepository.findOne(producer.username);
        if (!wallet) {
            throw new Error("Wallet not Found");
        }
        // await checkTransactionReference(reference);
        const transaction = yield createTransaction(producer.username, "BSYNC", reference, "Deposit", amount, String(Date.now()));
        wallet.balance = wallet.balance + amount;
        wallet.transactionHistory.push(transaction);
        walletRepository.update(wallet._id, wallet);
        return wallet;
    });
}
exports.verifyProducerDeposit = verifyProducerDeposit;
function checkWalletPin(walletPin, hashedPin) {
    if (!walletPin || walletPin.length < 4 || walletPin.length > 4) {
        throw new Error("Invalid wallet pin");
    }
    if (!compare(walletPin, hashedPin)) {
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
            yield checkTransactionReference(withdrawData.data.reference);
            const transaction = yield createTransaction("Bsync", producer.username, withdrawData.data.reference, "Withdrawal", withdrawData.data.amount / 100, withdrawData.data.createdAt);
            wallet.balance = wallet.balance - (withdrawData.data.amount / 100);
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
        const wallet = yield getProducerWallet(producer);
        if (wallet.pin) {
            throw new Error("Failed!, Wallet Pin already set");
        }
        wallet.pin = yield encode(walletPin);
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
function getAllP(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const pickers = yield pickerRepository.findByServiceArea(location);
        return pickers;
    });
}
exports.getAllP = getAllP;
function getMyWastes(producer) {
    return __awaiter(this, void 0, void 0, function* () {
        const wastes = yield wasteRepository.getAll();
        const myWastes = wastes.filter(waste => waste.producer._id.toString() === producer._id.toString() && !waste.isSold);
        return myWastes;
    });
}
exports.getMyWastes = getMyWastes;
function updateProducerWalletPin(producer, oldPin, newPin) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield getProducerWallet(producer);
        if (wallet.pin !== oldPin) {
            throw new Error("Failed Incorrect Pin");
        }
        wallet.pin = newPin;
        const response = walletRepository.update(wallet.id, wallet);
        if (!response) {
            throw new Error("An error Occurred, try again Later");
        }
        return "Wallet pin updated Successfully";
    });
}
exports.updateProducerWalletPin = updateProducerWalletPin;
function forgotWalletPinProducer(producer) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield tokenService.generateToken();
        tokenService.addToken(token, producer.email);
        const response = yield emailService.forgotPassword(producer.email, producer.name, token);
        if (!response) {
            throw new Error("An error occurred");
        }
        return response;
    });
}
exports.forgotWalletPinProducer = forgotWalletPinProducer;
function resetWalletPinProducer(producer, token, newPin) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield tokenService.checkToken(token, producer.email);
        if (response !== true) {
            throw new Error("Invalid Token");
        }
        const wallet = yield getProducerWallet(producer);
        wallet.pin = newPin;
        const updatedWallet = yield walletRepository.update(wallet.id, wallet);
        if (!updatedWallet) {
            throw new Error("An error occurred");
        }
        return "Wallet pin reset successful";
    });
}
exports.resetWalletPinProducer = resetWalletPinProducer;
function markWasteAsSold(wasteId) {
    return __awaiter(this, void 0, void 0, function* () {
        const waste = yield wasteRepository.markAsSold(wasteId);
        return waste;
    });
}
exports.markWasteAsSold = markWasteAsSold;
