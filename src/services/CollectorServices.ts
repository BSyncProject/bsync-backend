import { Collector} from '../models/Collector'; 
import { Wallet } from '../models/Wallet';
import CollectorRepository from '../repository/CollectorRepository';

import bcrypt from 'bcrypt';
import WalletRepository from '../repository/WalletRepository';
import PickerServices from '../services/PickerServices'
import { Picker } from '../models/Picker';
import {
  deposit, 
  verifyDeposit, 
  startWithdrawal,
  makeTransfer, 
} from './PaymentServices';
import { Transaction } from '../models/Transaction';
import TransactionRepository from '../repository/TransactionRepository';
import { Producer } from '../models/Producer';
import WasteRepository from '../repository/WasteRepository';
import { Waste } from '../models/Waste';
import { getProducer } from './ProducerServices';

const collectorRepository = new CollectorRepository();
const walletRepository = new WalletRepository();
const pickerServices  = new PickerServices();
const transactionRepository = new TransactionRepository();
const wasteRepository = new WasteRepository();

export async function signUpCollector(signUpData: Partial<Collector>): Promise<Collector> {

  if(!signUpData.password || !signUpData.username || !signUpData.email){
    throw new Error("Incomplete Details");
  }

  const existingCollector = await collectorRepository.check(signUpData.username, signUpData.email);
  if (existingCollector) {
    throw new Error('Username is already taken');
  }

  signUpData.password = await encode(signUpData.password);
  signUpData.wallet = await createNewWallet(signUpData.username);

  const newCollector = await collectorRepository.create(signUpData);
  return newCollector;
  
}


async function createNewWallet(username: string): Promise<Wallet> {
  const walletData: Partial<Wallet> = {
    owner: username,
    balance: 0,
    pin: "null",
  }
  const newWallet = await walletRepository.create(walletData);
  return newWallet;

}

async function encode(password: string) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}


export async function login(loginData: Partial<Collector>): Promise<Collector> {

  if(!loginData.password || !loginData.username){
    throw new Error("username or password not provided");
  }


  const foundCollector = await collectorRepository.findOne(loginData.username);
  if (!foundCollector){
    throw new Error("User Not found");
  }

  const passwordsMatch = await compare(loginData.password, foundCollector.password);

  if(!passwordsMatch){
    throw new Error("Incorrect Password");
  }

  return foundCollector;

}

const compare = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing:', error);
    return false; 
  }
};

export async function makeDeposit(amount: number, email: string): Promise<any>{

  if(amount <= 99){
    throw new Error("Invalid Amount, Minimum amount is 100");
  }

  const depositResponse = await deposit(amount, email);

  if(!depositResponse.data){
    throw new Error("An error occurred, Try again later")
  }
  return depositResponse.data;

}

export async function verifyCollectorDeposit(reference: string, collector: Collector, walletPin: string): Promise<any> {

  const data = await verifyDeposit(reference);

  if (!data.data || !(data.message == "Verification successful")){
    throw new Error("Verification not successful");
  }

  const wallet = await walletRepository.findOne(collector.username);
  if(!wallet){
    throw new Error("Wallet not Found");
  }

  checkWalletPin(walletPin, wallet.pin);

  await checkTransactionReference(reference);
  const transaction = await createTransaction(collector.username, "BSYNC", reference, "Deposit", data.data.amount/100, data.data.paid_at);
  wallet.balance = wallet.balance += (data.data.amount/100);
  wallet.transactionHistory.push(transaction);
  walletRepository.update(wallet._id, wallet);

  return data;
}

export async function makeWithdrawal(name: string, accountNumber: string, bank_code: string, amount: number, collector: Collector, walletPin: string): Promise<any>{

  try{
    if(!collector){
      throw new Error("Collector not provided");
    }
    if(amount <= 99){
      throw new Error("Invalid Amount, Minimum amount is 100");
    }

    const wallet = await walletRepository.findOne(collector.username);
    
    if(!wallet){ throw new Error('Collector does not have a wallet'); }
    await checkWalletPin(walletPin, wallet.pin);


    if(wallet.balance < amount){
      throw new Error("Insufficient Fund");
    }
    
    const data = await startWithdrawal(name, accountNumber, bank_code, amount);

    const withdrawData = await makeTransfer(amount, data.recipient_code);
    await checkTransactionReference(withdrawData.data.reference);

    if(!withdrawData){
      throw new Error("An Error occurred");
    }
  
    await checkTransactionReference(withdrawData.data.reference);
    
    const transaction = createTransaction("Bsync",collector.username, withdrawData.data.reference, "Withdrawal", withdrawData.data.amount/100, withdrawData.data.createdAt);
  
    wallet.balance = wallet.balance - (withdrawData.data.amount / 100);
    wallet.transactionHistory.push((await transaction));
    walletRepository.update(wallet._id, wallet);
    
    return withdrawData;

  } catch(error: any){
    throw new Error(`${error}`);
  }
  
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

export async function makePayment(collector: Collector, producerUsername: string, amount: number, walletPin: string): Promise<any>{


  const producer: Producer = await getProducer(producerUsername);
  const senderWallet = await walletRepository.findOne(collector.username);
  const receiverWallet = await walletRepository.findOne(producer.username);

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

  return "Successful";
}

function checkWalletPin(walletPin: string, hashedPin: string) {
  if (!(compare(walletPin, hashedPin))) {
    throw new Error("Wallet Pin incorrect");
  }
}

export async function getCollectorWallet(collector: Collector): Promise<Wallet>{

   const wallet = await walletRepository.findOne(collector.username);

   if(!wallet){
    throw new Error("Wallet Not Found");
   }

   return wallet;

}

export async function setWalletPin(walletPin: string, collector: Collector): Promise<Wallet>{

  const wallet = await getCollectorWallet(collector);

  if(wallet.pin){
    throw new Error("Failed!, Wallet Pin already set");
  }
  wallet.pin = await encode(walletPin);
  walletRepository.update(wallet._id, wallet);
  return wallet;
}

export async function becomeAgent(collector: Collector): Promise<any>{

  if(!collector){
    throw new Error("Collector not Provided")
  }

  collector.isAgent = true;
  await collectorRepository.update(collector._id, collector);
  return 'Collector is now an Agent';

}

export async function addPickerr(pickerData: any, collector: Collector): Promise<any>{

  await collectIsAgent(collector);
  pickerData.collector = collector;
  const picker = await pickerServices.addPicker(pickerData);
  return picker;

}

function collectIsAgent(collector: Collector) {
  if (!collector.isAgent) {
    throw new Error("Collector cannot perform this action, become an agent");
  }
}

export async function deletePickerr(pickerNumber: any, collector: Collector): Promise<any>{

  collectIsAgent(collector);
  const foundPicker = pickerServices.findOne(pickerNumber);
  await checkOwnerShip(foundPicker, collector);

  const response = await pickerServices.deletePicker((await foundPicker).id);
  return response;
  
}

export async function updatePickerr(pickerNumber: string, pickerData: any, collector: Collector){

  collectIsAgent(collector);
  const foundPicker = pickerServices.findOne(pickerNumber);
  await checkOwnerShip(foundPicker, collector);

  const updatedPicker = pickerServices.updatePicker((await foundPicker).id, pickerData);
  return updatedPicker;

}

async function checkOwnerShip(picker: Picker | Promise<Picker>, collector: Collector){

  let resolvedPicker: Picker;

  if (picker instanceof Promise) {
      resolvedPicker = await picker;
  } else {
      resolvedPicker = picker;
  }

  if (resolvedPicker.collector === undefined) {
      throw new Error("Collector is not defined for the picker");
  }

  if (!resolvedPicker.collector._id.equals(collector._id)) {
    throw new Error("Collector is not authorized");
  }
}

export async function getWastes(location: string): Promise<Waste[]>{
  
  const wastes = await wasteRepository.findWastesWithAddress(location);
  if(!wastes){

    throw new Error("No waste found");

  }

  return wastes;
}

export async function getCollector(username: string): Promise<Collector> {

  const collector = await collectorRepository.findOne(username);
  if(!collector){
    throw new Error("Producer not found");
  }
  return collector;

}

export async function getAllPickers(location: string): Promise<Picker[]> {

  const picker: Picker[] = await pickerServices.findByServiceArea(location);
  return picker;

}

export async function getCollectorPickers(collector: Collector) {

  const pickers: Picker[] = await pickerServices.findByCollector(collector);
  return pickers;

  
}
