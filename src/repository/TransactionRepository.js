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
const Transaction_1 = require("../models/Transaction");
class TransactionRepository {
    create(transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTransaction = yield Transaction_1.TransactionModel.create(transactionData);
            return newTransaction;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const allTransactions = yield Transaction_1.TransactionModel.find().exec();
            return allTransactions;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield Transaction_1.TransactionModel.findById(id).exec();
            return transaction;
        });
    }
    update(id, transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedTransaction = yield Transaction_1.TransactionModel.findByIdAndUpdate(id, transactionData, { new: true }).exec();
            return updatedTransaction;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Transaction_1.TransactionModel.findByIdAndDelete(id).exec();
        });
    }
}
exports.default = TransactionRepository;
