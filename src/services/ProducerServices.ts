import { Collector, CollectorModel } from '../models/Collector'; // Assuming Collector model is defined
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

  const waste: Waste = await wasteRepository.create(wasteData);
  return waste;

}
