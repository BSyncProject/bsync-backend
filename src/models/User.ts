import Wallet from './Wallet';

class User{

  private _username: string;
  private _password: string;
  private _email: string;
  private _phoneNumber: string;
  private _name: string;
  private _wallet: Wallet

  constructor() {
    this._username = "";
    this._password = "";
    this._email = "";
    this._phoneNumber = "";
    this._name = "";
    this._wallet = new Wallet()
  }

  get username(): string {
    return this._username;
  }

  set username(username: string) {
    this._username = username;
  }

  get password(): string {
    return this._password;
  }

  set password(password: string) {
    this._password = password;
  }

  get email(): string {
    return this._email;
  }

  set email(email: string) {
    this._email = email;
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  set phoneNumber(phoneNumber: string) {
    this._phoneNumber = phoneNumber;
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name;
  }


}

export default User;