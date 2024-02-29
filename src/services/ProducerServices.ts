import { Collector, CollectorModel } from '../models/Collector'; 
import { Producer } from '../models/Producer';
import { Wallet } from '../models/Wallet';
import { Waste, WasteModel } from '../models/Waste';
import ProducerRepository from '../repository/ ProducerRepository';
import WalletRepository from '../repository/WalletRepository';
import bcrypt from 'bcrypt';
import WasteRepository from '../repository/WasteRepository';


const producerRepository = new ProducerRepository();
const walletRepository = new WalletRepository();
const wasteRepository = new WasteRepository();


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
    throw new Error("An error occurred, Try again later")
  }
  const {createdData} = depositResponse.data
  return createdData;

}

export async function verifyProducerDeposit(reference: string, producer: Producer): Promise<any> {

  const data = await verifyDeposit(reference);

  if (!data.data && !(data.message == "Verification successful")){

    const wallet = producer.wallet;
    wallet.balance = wallet.balance += data.data.amount;
    walletRepository.update(wallet._id, wallet);

  }

  return data;

}

export async function makeWithdrawal(name: string, accountNumber: string, bank_code: string, amount: number, producer: Producer): Promise<any>{

  const withdrawData = await startWithdrawal(name, accountNumber, bank_code, amount);

  if (producer){

    const wallet = producer.wallet;
    wallet.balance = wallet.balance += (amount*10);
    walletRepository.update(wallet._id, wallet);

  }
  
  return withdrawData;
}

export async function completeWithdrawal(otp: number, transfer_code: string): Promise<any> {

  const completedData = finalizeTransfer(otp, transfer_code);
  return completedData;

}

export async function reportIssues(comment: string, type: string, date: string, provider: Producer ){




}

