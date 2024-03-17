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
const Waste_1 = require("../models/Waste"); // Assuming Waste model is defined
class WasteRepository {
    create(wasteData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newWaste = yield Waste_1.WasteModel.create(wasteData);
            return newWaste;
        });
    }
    findWastesWithAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const wastes = yield Waste_1.WasteModel.find({ location: address }).exec();
            return wastes;
        });
    }
    findWastesByProducer(producer) {
        return __awaiter(this, void 0, void 0, function* () {
            const wastes = yield Waste_1.WasteModel.find({ producer: producer._id, isSold: false }).exec();
            return wastes;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const allWastes = yield Waste_1.WasteModel.find().populate('producer').exec();
            return allWastes;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const waste = yield Waste_1.WasteModel.findById(id).populate('producer').exec();
            return waste;
        });
    }
    update(id, wasteData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedWaste = yield Waste_1.WasteModel.findByIdAndUpdate(id, wasteData, { new: true }).exec();
            return updatedWaste;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Waste_1.WasteModel.findByIdAndDelete(id).exec();
        });
    }
}
exports.default = WasteRepository;
