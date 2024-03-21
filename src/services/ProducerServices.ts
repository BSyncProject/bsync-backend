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
import TokenService from './TokenServices';

import { format } from 'date-fns';
const producerRepository = new ProducerRepository();
const walletRepository = new WalletRepository();
const wasteRepository = new WasteRepository();
const transactionRepository = new TransactionRepository();
const pickerRepository = new PickerRepository();
const emailService = new EmailServices();
const tokenService = new TokenService();


export async function signUp(signUpData: Partial<Producer>, pin: string): Promise<Producer> {

  if(!signUpData.password || !signUpData.username || !signUpData.email){
    throw new Error("An error occurred");
  }

  const existingProducer = await producerRepository.check(signUpData.username, signUpData.email);
    
  if (existingProducer) {
    throw new Error('Username or email is already taken');
  }

  signUpData.password = await encode(signUpData.password);
  signUpData.wallet = await createNewWallet(signUpData.username, pin)

  const newProducer = await producerRepository.create(signUpData);
  const response = await emailService.sendNewAccountEmail(newProducer.email, newProducer.name);
  return newProducer;
  
}

async function createNewWallet(username: string, pin: string): Promise<Wallet> {
  const hashedPin = await encode(pin);
  const walletData: Partial<Wallet> = {
    owner: username,
    balance: 0,
    pin: hashedPin,
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

export async function verifyProducerDeposit(amount: number, reference: string, producer: Producer): Promise<any> {

  const wallet = await walletRepository.findOne(producer.username);
  if(!wallet){
    throw new Error("Wallet not Found");
  }

  await checkTransactionReference(reference);
  
  const transaction = await createTransaction(producer.username, "BSYNC", reference, "Deposit", amount, `${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')}`);
  wallet.balance = wallet.balance + amount;
  wallet.transactionHistory.push(transaction);
  walletRepository.update(wallet._id, wallet);

  return wallet;
}

async function checkWalletPin(walletPin: string, hashedPin: string) {
  if (!walletPin || walletPin.length < 4 || walletPin.length > 4) {
    throw new Error("Invalid wallet pin");
  }

  const isMatch: Boolean = await compare(walletPin, hashedPin);
  if(!isMatch){
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

    await checkWalletPin(walletPin, wallet.pin);

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

  const senderTransaction = await createTransaction(collector.username, producer.username, String(Date.now()), "Debit", amount, `${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')}`);
  senderWallet.transactionHistory.push(senderTransaction);

  const receiverTransaction = await createTransaction(collector.username, producer.username, String(Date.now()), "Credit", amount, `${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')}`);
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

  const wastes = await wasteRepository.getAll();
  const myWastes = wastes.filter(waste => 
    waste.producer._id.toString() === producer._id.toString() && !waste.isSold
  );

  return myWastes;
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


export async function forgotWalletPinProducer(producer: Producer){

  const token = await tokenService.generateToken();
  tokenService.addToken(token, producer.email);
  const response  = await emailService.forgotPassword(producer.email, producer.name, token);
  if(!response){
    throw new Error("An error occurred");
  }

  return response;
}

export async function resetWalletPinProducer(producer: Producer, token: string, newPin: string){

  const response =await tokenService.checkToken(token, producer.email);
  
  if(response !== true){ throw new Error("Invalid Token"); }

  const wallet = await getProducerWallet(producer);
  wallet.pin = newPin;

  const updatedWallet = await walletRepository.update(wallet.id, wallet);

  if(!updatedWallet){ throw new Error("An error occurred"); }

  return "Wallet pin reset successful";

}

export async function markWasteAsSold(wasteId: string){

  const waste = await wasteRepository.markAsSold(wasteId);
  return waste;
  
}
