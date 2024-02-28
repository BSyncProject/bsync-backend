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
const Producer_1 = require("../models/Producer"); // Assuming Producer model is defined
class ProducerRepository {
    create(producerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newProducer = yield Producer_1.ProducerModel.create(producerData);
            return newProducer;
        });
    }
    check(username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const producer = yield this.findOne(username);
            if (producer) {
                return producer;
            }
            else {
                return Producer_1.ProducerModel.findOne({ email: email });
            }
        });
    }
    findOne(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundProducer = Producer_1.ProducerModel.findOne({ username: username });
            return foundProducer;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const allProducers = yield Producer_1.ProducerModel.find().populate('waste').exec();
            return allProducers;
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const producer = yield Producer_1.ProducerModel.findById(id).populate('waste').exec();
            return producer;
        });
    }
    update(id, producerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedProducer = yield Producer_1.ProducerModel.findByIdAndUpdate(id, producerData, { new: true }).exec();
            return updatedProducer;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Producer_1.ProducerModel.findByIdAndDelete(id).exec();
        });
    }
}
exports.default = ProducerRepository;
