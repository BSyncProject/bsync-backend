import User from "./User";
import Transaction from "./Transaction";


class Wallet {
  private _transactionHistory: Transaction[];
  private _owner: User;
  private _balance: number;

  constructor() {
    this._transactionHistory = [];
    this._owner = new User(); 
    this._balance = 0;
  }

  get transactionHistory(): Transaction[] {
    return this._transactionHistory;
  }

  set transactionHistory(transactionHistory: Transaction[]) {
    this._transactionHistory = transactionHistory;
  }

  get owner(): User {
    return this._owner;
  }

  set owner(owner: User) {
    this._owner = owner;
  }

  
  checkBalance(): number {
    return this._balance;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero.');
    }
    this._balance += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero.');
    }
    if (amount > this._balance) {
      throw new Error('Insufficient balance.');
    }
    this._balance -= amount;
  }

}

export default Wallet;
