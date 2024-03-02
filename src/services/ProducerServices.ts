import { Producer } from '../models/Producer';
import { Wallet } from '../models/Wallet';
import { Waste, WasteModel } from '../models/Waste';
import ProducerRepository from '../repository/ ProducerRepository';
import WalletRepository from '../repository/WalletRepository';
import bcrypt from 'bcrypt';
import WasteRepository from '../repository/WasteRepository';
import TransactionRepository from '../repository/TransactionRepository';
import {
  deposit, 
  verifyDeposit, 
  startWithdrawal, 
  finalizeTransfer,
  makeTransfer
} from './PaymentServices';
import { Transaction } from '../models/Transaction';




const producerRepository = new ProducerRepository();
const walletRepository = new WalletRepository();
const wasteRepository = new WasteRepository();
const transactionRepository = new TransactionRepository();


export async function signUp(signUpData: Partial<Producer>): Promise<Producer> {

  if(!signUpData.password || !signUpData.username || !signUpData.email){
    throw new Error("An error occurred");
  }

  const existingProducer = await producerRepository.check(signUpData.username, signUpData.email);
    
  if (existingProducer) {
    throw new Error('Username is already taken');
  }

  signUpData.password = await encodePassword(signUpData.password);
  signUpData.wallet = await createNewWallet(signUpData.username)

  const newProducer = await producerRepository.create(signUpData);
  return newProducer;
  
}

async function createNewWallet(username: string): Promise<Wallet> {
  const walletData: Partial<Wallet> = {
    owner: username,
    balance: 0
  }
  const newWallet = await walletRepository.create(walletData);
  return newWallet;

}

async function encodePassword(password: string) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function login(loginData: Partial<Producer>): Promise<Producer> {

  if(!loginData.password || !loginData.username){
    throw new Error("username or password not provided");
  }


  const foundProducer = await producerRepository.findOne(loginData.username);
  if (!foundProducer){
    throw new Error("User Not found");
  }

  const passwordsMatch = await comparePasswords(loginData.password, foundProducer.password);

  if(!passwordsMatch){
    throw new Error("Incorrect Password");
  }

  return foundProducer;

}

const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false; 
  }
};

export async function postWaste(wasteData: Partial<Waste>, producer: Producer): Promise<Waste>{

  if(!producer){
    throw new Error("Unknown User");
  }

  wasteData.producer = producer;
  wasteData.datePosted = new Date();

  const waste: Waste = await wasteRepository.create(wasteData);
  return waste;

}


export async function deleteWaste(waste_id: Partial<string>, producer: Producer) {

  const waste = await wasteRepository.getById(waste_id)
  if(waste?.producer == producer){
    wasteRepository.delete(waste._id);
    return "Waste deleted successfully";

  } 
  throw new Error("Unauthorized");
}

export async function makeDeposit(amount: number, email: string): Promise<any>{

  const depositResponse = await deposit(amount, email);

  if(!depositResponse.data){
    throw new Error("An error occurred, Try again")
  }

  return depositResponse.data

}

export async function verifyProducerDeposit(reference: string, producer: Producer): Promise<any> {

  const data = await verifyDeposit(reference);

  if (!data.data || !(data.message == "Verification successful")){
    throw new Error("Verification not successful");
  }
  const wallet = await walletRepository.findOne(producer.username);
  if(!wallet){
    throw new Error("Wallet not Found");
  }

  checkTransactionReference(reference);
  
  const transaction = createTransaction(producer.username, "BSYNC", reference, "Deposit", data.data.amount, data.data.paid_at);
  wallet.balance = wallet.balance + data.data.amount;
  wallet.transactionHistory.push((await transaction));
  walletRepository.update(wallet._id, wallet);

  return data;
}

const checkTransactionReference = async(reference: string): Promise<void> => {

  const transaction = await transactionRepository.findOne(reference);

  if(transaction){
    throw new Error("Transaction Already Verified");
  }
  
}

function createTransaction(sender: string, receiver: string, reference: string, type: string, amount: number, date: string) {
  const transactionData: Partial<Transaction> = {
    sender: sender,
    type: type,
    receiver: receiver,
    amount: amount,
    reference: reference,
    comment: type,
    date: date,
  };
  const transaction = transactionRepository.create(transactionData);
  return transaction;
}

export async function makeWithdrawal(name: string, accountNumber: string, bank_code: string, amount: number, producer: Producer): Promise<any>{

  try{
    let withdrawData;

    if (producer){
      const wallet = await walletRepository.findOne(producer.username);

      if(!wallet){
        throw new Error('Producer does not have a wallet');
      }

      if(wallet.balance < amount){
        throw new Error("Insufficient Balance");
      }
      const data = await startWithdrawal(name, accountNumber, bank_code, amount);
      
      withdrawData = await makeTransfer(amount, data.recipient_code);

    }
  
    return withdrawData;
  } catch(error: any){
    throw new Error(`${error}`);
  }
  
}

export async function completeWithdrawal(otp: number, transfer_code: string, producer: Producer): Promise<any> {

  const completedData = await finalizeTransfer(otp, transfer_code);

  if(!completedData){
    throw new Error("An Error occurred")
  }

  const wallet = await walletRepository.findOne(producer.username);
  
  if(!wallet){
    throw new Error('An error occurred');
  }

  checkTransactionReference(completedData.data.reference);
  
  const transaction = createTransaction("Bsync",producer.username, completedData.data.reference, "Withdrawal", completedData.data.amount, completedData.data.create_at);

  wallet.balance = wallet.balance - completedData.data.amount;
  wallet.transactionHistory.push((await transaction));
  walletRepository.update(wallet._id, wallet);

  return completedData;

}

export async function reportIssues(comment: string, type: string, date: string, provider: Producer ){




}

