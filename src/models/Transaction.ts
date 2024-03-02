import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Transaction extends Document {
  _id: Types.ObjectId;
  type: string,
  sender: string;
  receiver: string;
  amount: number;
  date: string;
  comment: string;
  reference: string;

  
}

const transactionSchema: Schema = new Schema({
  type: {type: String, required: true},
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  date: { type: String, required: true },
  amount: { type: String, required: true },
  comment: { type: String, required: true },
  reference: { type: String, required: true },
});

export const TransactionModel = mongoose.model<Transaction>('Transaction', transactionSchema);
