import { Wallet, WalletModel } from '../models/Wallet'; // Assuming Wallet model is defined

class WalletRepository {
  async create(walletData: Partial<Wallet>): Promise<Wallet> {
    const newWallet = await WalletModel.create(walletData);
    return newWallet;
  }

  async findOne(username: string): Promise<Wallet | null> {

    const wallet = await WalletModel.findOne({owner: username}).populate('transactionHistory').exec();
    return wallet;
  }

  async getAll(): Promise<Wallet[]> {
    const allWallets = await WalletModel.find().populate('transactionHistory').populate('owner').exec();
    return allWallets;
  }

  async getById(id: string): Promise<Wallet | null> {
    const wallet = await WalletModel.findById(id).populate('transactionHistory').populate('owner').exec();
    return wallet;
  }

  async update(id: string, walletData: Partial<Wallet>): Promise<Wallet | null> {
    const updatedWallet = await WalletModel.findByIdAndUpdate(id, walletData, { new: true }).exec();
    return updatedWallet;
  }

  async delete(id: string): Promise<void> {
    await WalletModel.findByIdAndDelete(id).exec();
  }
}

export default WalletRepository;
