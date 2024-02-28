import {Wallet} from './Wallet';

export interface User{

  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  name: string;
  wallet: Wallet
  address: string;

}
