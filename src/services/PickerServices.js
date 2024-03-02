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
const PickerRepository_1 = __importDefault(require("../repository/PickerRepository"));
const pickerRepository = new PickerRepository_1.default();
class PickerServices {
    addPicker(pickerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const picker = yield pickerRepository.create(pickerData);
            return picker;
        });
    }
    deletePicker(picker_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pickerRepository.delete(picker_id);
            return 'picker deleted successfully';
        });
    }
    updatePicker(picker_id, pickerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const picker = yield pickerRepository.update(picker_id, pickerData);
            return picker;
        });
    }
    findOne(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundPicker = yield pickerRepository.findOne(phoneNumber);
            if (foundPicker == null) {
                throw new Error(`picker with phoneNumber ${phoneNumber} not found`);
            }
            return foundPicker;
        });
    }
}
exports.default = PickerServices;
