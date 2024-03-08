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
const Collector_1 = require("../models/Collector"); // Assuming Collector model is defined
class CollectorRepository {
    create(collectorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCollector = yield Collector_1.CollectorModel.create(collectorData);
            return newCollector;
        });
    }
    findOne(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundCollector = Collector_1.CollectorModel.findOne({ username: username });
            return foundCollector;
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundCollector = Collector_1.CollectorModel.findOne({ email: email });
            return foundCollector;
        });
    }
    check(username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const collector = yield this.findOne(username);
            if (collector) {
                return collector;
            }
            else {
                return Collector_1.CollectorModel.findOne({ email: email });
            }
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const allCollectors = yield Collector_1.CollectorModel.find().populate('picker').exec();
            return allCollectors;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const collector = yield Collector_1.CollectorModel.findById(id).populate('picker').exec();
            return collector;
        });
    }
    update(id, collectorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedCollector = yield Collector_1.CollectorModel.findByIdAndUpdate(id, collectorData, { new: true }).exec();
            return updatedCollector;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Collector_1.CollectorModel.findByIdAndDelete(id).exec();
        });
    }
}
exports.default = CollectorRepository;
