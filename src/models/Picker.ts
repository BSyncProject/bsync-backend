import Collector from "./Collector"

class Picker {
  private _name: string;
  private _address: string;
  private _phoneNumber: string;
  private _serviceArea: string;
  private _collector: Collector;

  constructor() {
    this._name = '';
    this._address = '';
    this._phoneNumber = '';
    this._serviceArea = '';
    this._collector = new Collector();
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name;
  }

  get address(): string {
    return this._address;
  }

  set address(address: string) {
    this._address = address;
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  set phoneNumber(phoneNumber: string) {
    this._phoneNumber = phoneNumber;
  }

  get serviceArea(): string {
    return this._serviceArea;
  }

  set serviceArea(serviceArea: string) {
    this._serviceArea = serviceArea;
  }

  get collector(): Collector {
    return this._collector;
  }

  set collector(collector: Collector) {
    this._collector = collector;
  }
}

export default Picker