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
  makeTransfer
} from './PaymentServices';
import { Transaction } from '../models/Transaction';
import { Collector } from '../models/Collector';
import { getCollector } from './CollectorServices';
import { Picker } from '../models/Picker';
import PickerRepository from '../repository/PickerRepository';
import EmailServices from './EmailServices';


const producerRepository = new ProducerRepository();
const walletRepository = new WalletRepository();
const wasteRepository = new WasteRepository();
const transactionRepository = new TransactionRepository();
const pickerRepository = new PickerRepository();
const emailService = new EmailServices();


export async function signUp(signUpData: Partial<Producer>): Promise<Producer> {

  if(!signUpData.password || !signUpData.username || !signUpData.email){
    throw new Error("An error occurred");
  }

  const existingProducer = await producerRepository.check(signUpData.username, signUpData.email);
    
  if (existingProducer) {
    throw new Error('Username is already taken');
  }

  signUpData.password = await encode(signUpData.password);
  signUpData.wallet = await createNewWallet(signUpData.username)

  const newProducer = await producerRepository.create(signUpData);
  const response = await emailService.sendNewAccountEmail(newProducer.email, newProducer.name);
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

async function encode(word: string) {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedWord = bcrypt.hashSync(word, salt);
  return hashedWord;
}

export async function login(loginData: Partial<Producer>): Promise<Producer> {

  if(!loginData.password || !loginData.username){
    throw new Error("username or password not provided");
  }


  const foundProducer = await producerRepository.findOne(loginData.username);
  if (!foundProducer){
    throw new Error("User Not found");
  }

  const passwordsMatch = await compare(loginData.password, foundProducer.password);

  if(!passwordsMatch){
    throw new Error("Incorrect Password");
  }

  return foundProducer;

}

const compare = async (plainWord: string, hashedWord: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainWord, hashedWord);
  } catch (error) {
    console.error('Error comparing:', error);
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

  if(amount <= 99){
    throw new Error("Invalid Amount, Minimum amount is 100");
  }
  const depositResponse = await deposit(amount, email);

  if(!depositResponse.data){
    throw new Error("An error occurred, Try again")
  }

  return depositResponse.data

}

export async function verifyProducerDeposit(reference: string, producer: Producer, walletPin: string): Promise<any> {

  const data = await verifyDeposit(reference);

  if (!data.data || !(data.message == "Verification successful")){
    throw new Error("Verification not successful");
  }

  const wallet = await walletRepository.findOne(producer.username);
  if(!wallet){
    throw new Error("Wallet not Found");
  }

  checkWalletPin(walletPin, wallet.pin);
  await checkTransactionReference(reference);
  
  const transaction = await createTransaction(producer.username, "BSYNC", reference, "Deposit", (data.data.amount/100), data.data.paid_at);
  wallet.balance = wallet.balance + (data.data.amount/100);
  wallet.transactionHistory.push(transaction);
  walletRepository.update(wallet._id, wallet);

  return data;
}

function checkWalletPin(walletPin: string, hashedPin: string) {
  if (!(compare(walletPin, hashedPin))) {
    throw new Error("Wallet Pin incorrect");
  }
}

const checkTransactionReference = async(reference: string): Promise<void> => {

  const transaction = await transactionRepository.findOne(reference);

  if(transaction){
    throw new Error("Transaction Already Verified");
  }
  
}

async function createTransaction(sender: string, receiver: string, reference: string, type: string, amount: number, date: string) {
  const transactionData: Partial<Transaction> = {
    sender: sender,
    type: type,
    receiver: receiver,
    amount: amount,
    reference: reference,
    comment: type,
    date: date,
  };
  const transaction = await transactionRepository.create(transactionData);
  return transaction;
}

export async function makeWithdrawal(name: string, accountNumber: string, bank_code: string, amount: number, producer: Producer, walletPin: string): Promise<any>{

  try{

    if (!producer){
      throw new Error("Producer is not provided")
    }
    if(amount <= 99){
      throw new Error("Invalid Amount, Minimum amount is 100");
    }
    const wallet = await walletRepository.findOne(producer.username);

    if(!wallet){
      throw new Error('Producer does not have a wallet');
    }

    checkWalletPin(walletPin, wallet.pin);

    if(wallet.balance < amount){
      throw new Error("Insufficient Balance");
    }
    const data = await startWithdrawal(name, accountNumber, bank_code, amount);
    
    const withdrawData = await makeTransfer(amount, data.recipient_code);
    await checkTransactionReference(withdrawData.data.reference);

    const transaction = await createTransaction("Bsync",producer.username, withdrawData.data.reference, "Withdrawal", withdrawData.data.amount/100, withdrawData.data.createdAt);

    wallet.balance = wallet.balance - (withdrawData.data.amount / 100);
    wallet.transactionHistory.push(transaction);
    walletRepository.update(wallet._id, wallet);

    return withdrawData;

  } catch(error: any){
    throw new Error(`${error}`);
  }
  
}

export async function setWalletPin(walletPin: string, producer: Producer): Promise<Wallet>{

  const wallet = await getProducerWallet(producer);
  if(wallet.pin){
    throw new Error("Failed!, Wallet Pin already set");
  }

  wallet.pin = await encode(walletPin);
  walletRepository.update(wallet._id, wallet);
  return wallet;
}

export async function makePayment(producer: Producer, collectorUsername: string, amount: number, walletPin: string): Promise<any>{


  if(amount <= 99){
    throw new Error("Invalid Amount, Minimum amount is 100");
  }

  const collector: Collector = await getCollector(collectorUsername);
  const senderWallet = await walletRepository.findOne(producer.username);
  const receiverWallet = await walletRepository.findOne(collector.username);

  if (!senderWallet || !receiverWallet ){
    throw new Error('Wallet not found')
  }

  checkWalletPin(walletPin, senderWallet.pin);
  
  if(senderWallet.balance < amount){
    throw new Error('Insufficient Balance');
  }

  senderWallet.balance = senderWallet.balance - amount;
  receiverWallet.balance = receiverWallet.balance + amount; 

  const senderTransaction = await createTransaction(collector.username, producer.username, `${Date.now()}`, "Debit", amount, String(Date.now()));
  senderWallet.transactionHistory.push(senderTransaction);

  const receiverTransaction = await createTransaction(collector.username, producer.username, `${Date.now()}`, "Credit", amount, String(Date.now()));
  receiverWallet.transactionHistory.push(receiverTransaction);

  walletRepository.update(senderWallet._id, senderWallet);
  walletRepository.update(receiverWallet._id, receiverWallet);
  return "Successful"

}


export async function reportIssues(comment: string, type: string, date: string, provider: Producer ){




}

export async function getProducerWallet(producer: Producer): Promise<Wallet>{

  const wallet = await walletRepository.findOne(producer.username);

   if(!wallet){
    throw new Error("Wallet Not Found");
   }

   return wallet;
  
}

export async function getProducer(username: string): Promise<Producer> {

  const producer = await producerRepository.findOne(username);
  if(!producer){
    throw new Error("Producer not found");
  }
  return producer;

}

export async function getAllP(location: string): Promise<Picker[]> {

  const pickers = await pickerRepository.findByServiceArea(location);
  return pickers;

}

export async function getMyWastes(producer: Producer): Promise<Waste[]> {

  const wastes = await wasteRepository.findWastesByProducer(producer);
  return wastes
}

export async function updateProducerWalletPin(producer: Producer, oldPin: string, newPin: string){
  const wallet = await getProducerWallet(producer);
  
  if(wallet.pin !== oldPin){
    throw new Error("Failed Incorrect Pin");
  }

  wallet.pin = newPin;
  const response= walletRepository.update(wallet.id, wallet);

  if(!response){
    throw new Error("An error Occurred, try again Later");

  }

  return "Wallet pin updated Successfully";
}
