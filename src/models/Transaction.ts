
class Transaction {
  private _sender: string;
  private _receiver: string;
  private _amount: number;
  private _date: number;
  private _comment: string;
  private _detail: string;

  constructor() {
    this._sender = '';
    this._receiver = '';
    this._amount = 0;
    this._date = Date.now();
    this._comment = '';
    this._detail = '';
  }

  get sender(): string {
    return this._sender;
  }

  set sender(sender: string) {
    this._sender = sender;
  }

  get receiver(): string {
    return this._receiver;
  }

  set receiver(receiver: string) {
    this._receiver = receiver;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(amount: number) {
    this._amount = amount;
  }

  get date(): number {
    return this._date;
  }

  set date(date: number) {
    this._date = date;
  }

  get comment(): string {
    return this._comment;
  }

  set comment(comment: string) {
    this._comment = comment;
  }

  get detail(): string {
    return this._detail;
  }

  set detail(detail: string) {
    this._detail = detail;
  }
}

export default Transaction;
