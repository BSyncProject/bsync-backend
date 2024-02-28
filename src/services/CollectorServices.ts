import { Collector, CollectorModel } from '../models/Collector'; // Assuming Collector model is defined
import { Wallet } from '../models/Wallet';
import CollectorRepository from '../repository/CollectorRepository';

import bcrypt from 'bcrypt';
import WalletRepository from '../repository/WalletRepository';

const collectorRepository = new CollectorRepository();
const walletRepository = new WalletRepository();

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