import { Collector, CollectorModel } from '../models/Collector'; // Assuming Collector model is defined
import { Wallet } from '../models/Wallet';
import CollectorRepository from '../repository/CollectorRepository';

import bcrypt from 'bcrypt';
import WalletRepository from '../repository/WalletRepository';
import PickerServices from '../services/PickerServices'
import { Picker } from '../models/Picker';

const collectorRepository = new CollectorRepository();
const walletRepository = new WalletRepository();
const pickerServices  = new PickerServices();

export async function signUpCollector(signUpData: Partial<Collector>): Promise<Collector> {

  if(!signUpData.password || !signUpData.username || !signUpData.email){
    throw new Error("An error occurred");
  }

  const existingCollector = await collectorRepository.check(signUpData.username, signUpData.email);
  if (existingCollector) {
    throw new Error('Username is already taken');
  }

  signUpData.password = await encodePassword(signUpData.password)
  signUpData.wallet = await createNewWallet(signUpData.username);

  const newCollector = await collectorRepository.create(signUpData);
  return newCollector;
  
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


export async function login(loginData: Partial<Collector>): Promise<Collector> {

  if(!loginData.password || !loginData.username){
    throw new Error("username or password not provided");
  }


  const foundCollector = await collectorRepository.findOne(loginData.username);
  if (!foundCollector){
    throw new Error("User Not found");
  }

  const passwordsMatch = await comparePasswords(loginData.password, foundCollector.password);

  if(!passwordsMatch){
    throw new Error("Incorrect Password");
  }

  return foundCollector;

}

const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false; 
  }
};

export async function makeDeposit(amount: number, email: string): Promise<any>{

  const depositResponse = await deposit(amount, email);

  if(!depositResponse.data){
    throw new Error("An error occurred, Try again later")
  }
  const {createdData} = depositResponse.data
  return createdData;

}

export async function verifyCollectorDeposit(reference: string, collector: Collector): Promise<any> {

  const data = await verifyDeposit(reference);

  if (!data.data && !(data.message == "Verification successful")){

    const wallet = collector.wallet;
    wallet.balance = wallet.balance += data.data.amount;
    walletRepository.update(wallet._id, wallet);

  }
  return data;
}

export async function makeWithdrawal(name: string, accountNumber: string, bank_code: string, amount: number, collector: Collector): Promise<any>{

  const withdrawData = await startWithdrawal(name, accountNumber, bank_code, amount);

  if (collector){

    const wallet = await walletRepository.findOne(collector.username);
    
    if(!wallet){
      throw new Error('An error occurred');
    }

    if(wallet.balance < amount){
      throw new Error("Insufficient Fund");
    }

    wallet.balance = wallet.balance -= amount;
    walletRepository.update(wallet._id, wallet);

  }
  
  return withdrawData;
}

export async function completeWithdrawal(otp: number, transfer_code: string): Promise<any> {

  const completedData = finalizeTransfer(otp, transfer_code);
  return completedData;

}

export async function becomeAgent(collector: Collector): Promise<any>{

  if(!collector){
    throw new Error("Collector not Provided")
  }

  collector.isAgent = true;
  collectorRepository.update(collector._id, collector);

  return 'Collector is now an Agent';


}

export async function addPickerr(pickerData: any, collector: Collector): Promise<any>{

  collectIsAgent(collector);
  pickerData.collector = collector;
  const picker = await pickerServices.addPicker(pickerData);
  return picker;

}

function collectIsAgent(collector: Collector) {
  if (!collector.isAgent) {
    throw new Error("Collector cannot Perform this action, become an agent");
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

  if (resolvedPicker.collector !== collector) {
      throw new Error("Collector is not authorized");
  }
}