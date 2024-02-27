import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Transaction extends Document {
  _id: Types.ObjectId;
  sender: string;
  receiver: string;
  amount: number;
  date: number;
  comment: string;
  detail: string;

  
}

const transactionSchema: Schema = new Schema({
  sender: { type: Number, required: true },
  receiver: { type: String, required: true },
  date: { type: Number, required: true },
  amount: { type: String, required: true },
  comment: { type: String, required: true },
  detail: { type: String, required: true },
});

export const TransactionModel = mongoose.model<Transaction>('Transaction', transactionSchema);
