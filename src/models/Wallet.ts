import mongoose, { Schema, Document } from 'mongoose';
import { Transaction, TransactionModel } from './Transaction'; 
import { User } from './User';

export interface Wallet extends Document {
  transactionHistory: Transaction[];
  owner: string;
  balance: number;
  pin: string;
}

const walletSchema: Schema = new Schema({
  transactionHistory: [{ type: Schema.Types.ObjectId, ref: 'Transaction', default: [] }],
  owner: { type: String, required: true },
  balance: { type: Number, required: true },
  pin: { type: String},
});

export const WalletModel = mongoose.model<Wallet>('Wallet', walletSchema);

