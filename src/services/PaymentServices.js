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
const deposit = (amount, email) => __awaiter(void 0, void 0, void 0, function* () {
    const requestData = {
        email: email,
        amount: (amount * 10),
    };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    };
    const url = process.env.DEPOSIT_URL || "call Payment platform";
    try {
        const data = yield fetch(url, requestOptions)
            .then(response => response.json());
        return data;
    }
    catch (error) {
        throw new Error(`${error}`);
    }
    ;
});
const verifyDeposit = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${process.env.VERIFY_URL}/${reference}`;
    try {
        const responseData = yield fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.PAYMENT_SECRET_KEY}`
            }
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response network issues');
            }
            return response.json();
        });
        return responseData;
    }
    catch (error) {
        return error;
    }
    ;
});
const startWithdrawal = (name, account_number, bank_code, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const url = process.env.RECIPIENT_CREATE_URL || "create url";
    const requestData = JSON.stringify({
        type: "nuban",
        name: name,
        account_number: account_number,
        bank_code: bank_code,
        currency: "NGN"
    });
    yield fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: requestData
    })
        .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
        .then(dataObject => {
        const { data } = dataObject;
        const response = makeTransfer(amount, data.recipient_code);
        return response;
    })
        .catch(error => {
        return error;
    });
});
const makeTransfer = (amount, recipient_code) => {
    const url = process.env.TRANSFER_URL || "transfer to recipient";
    const requestData = JSON.stringify({
        source: "balance",
        reason: "Bsync Withdrawal Payment",
        amount: (amount * 10),
        recipient: recipient_code
    });
    fetch(url, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: requestData
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        return data;
    })
        .catch(error => {
        return error;
    });
};
const finalizeTransfer = (otp, transfer_code) => {
    const url = process.env.FINAL_PAYMENT || 'make transfer';
    const requestData = JSON.stringify({
        transfer_code: transfer_code,
        otp: otp,
    });
    try {
        fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: requestData
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            return data;
        });
    }
    catch (error) {
        throw new Error('Error' + `${error}`);
    }
};
module.exports = {
    deposit,
    verifyDeposit,
    startWithdrawal,
    finalizeTransfer,
};
