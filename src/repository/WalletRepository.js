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
const Wallet_1 = require("../models/Wallet"); // Assuming Wallet model is defined
class WalletRepository {
    create(walletData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newWallet = yield Wallet_1.WalletModel.create(walletData);
            return newWallet;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const allWallets = yield Wallet_1.WalletModel.find().populate('transactionHistory').populate('owner').exec();
            return allWallets;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield Wallet_1.WalletModel.findById(id).populate('transactionHistory').populate('owner').exec();
            return wallet;
        });
    }
    update(id, walletData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedWallet = yield Wallet_1.WalletModel.findByIdAndUpdate(id, walletData, { new: true }).exec();
            return updatedWallet;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Wallet_1.WalletModel.findByIdAndDelete(id).exec();
        });
    }
}
exports.default = WalletRepository;
