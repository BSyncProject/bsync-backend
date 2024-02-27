import {Transaction} from "../models/Transaction";
import {TransactionModel} from "../models/Transaction"

class TransactionRepository {

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = await TransactionModel.create(transactionData);
    return newTransaction;
  }

  async getAll(): Promise<Transaction[]> {
    const allTransactions = await TransactionModel.find().exec();
    return allTransactions;
  }

  async getById(id: string): Promise<Transaction | null> {
    const transaction = await TransactionModel.findById(id).exec();
    return transaction;
  }

  async update(id: string, transactionData: Partial<Transaction>): Promise<Transaction | null> {
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(id, transactionData, { new: true }).exec();
    return updatedTransaction;
  }

  async delete(id: string): Promise<void> {
    await TransactionModel.findByIdAndDelete(id).exec();
  }
}

export default TransactionRepository;
