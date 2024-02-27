import mongoose, { Schema, Document } from 'mongoose';
import { Transaction, TransactionModel } from './Transaction'; 
import { User } from './User';

export interface Wallet extends Document {
  transactionHistory: Transaction[];
  owner: User;
  balance: number;
}

const walletSchema: Schema = new Schema({
  transactionHistory: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, required: true },
});

export const WalletModel = mongoose.model<Wallet>('Wallet', walletSchema);

