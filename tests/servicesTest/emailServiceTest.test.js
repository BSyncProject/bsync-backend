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
// const EmailServices = require('../../src/services/EmailServices');
const EmailServices_1 = __importDefault(require("../../src/services/EmailServices"));
const emailService = new EmailServices_1.default();
describe('sendNewAccountEmail', () => {
    it('sends new account email successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const receiverEmail = 'kelvin475@yahoo.com';
        const name = 'Ejiofor Kevin';
        const response = yield emailService.sendNewAccountEmail(receiverEmail, name);
        expect(response.messageId).toBeDefined;
    }), 15000);
    it('throws an error when failed to send email', () => __awaiter(void 0, void 0, void 0, function* () {
        const receiverEmail = 'test@';
        const name = 'Test User';
        yield expect(emailService.sendNewAccountEmail(receiverEmail, name)).resolves.toMatchObject({
            code: 'invalid_parameter',
            message: 'email is not valid in to'
        });
    }), 15000);
});
