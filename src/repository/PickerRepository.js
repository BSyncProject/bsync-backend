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
const Picker_1 = require("../models/Picker"); // Assuming Picker model is defined
class PickerRepository {
    create(pickerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPicker = yield Picker_1.PickerModel.create(pickerData);
            return newPicker;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const allPickers = yield Picker_1.PickerModel.find().populate('collector').exec();
            return allPickers;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const picker = yield Picker_1.PickerModel.findById(id).populate('collector').exec();
            return picker;
        });
    }
    update(id, pickerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedPicker = yield Picker_1.PickerModel.findByIdAndUpdate(id, pickerData, { new: true }).exec();
            return updatedPicker;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Picker_1.PickerModel.findByIdAndDelete(id).exec();
        });
    }
}
exports.default = PickerRepository;
