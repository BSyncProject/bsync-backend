import Producer from "./Producer";

class Waste{

  private _wasteType: string
  private _quantity: string
  private _location: string
  private _producer: Producer

  constructor() {
    this._wasteType = "";
    this._quantity = "";
    this._location = "";
    this._producer = new Producer();
  }

  get wasteType(): string {
    return this._wasteType;
  }

  set wasteType(wasteType: string) {
    this._wasteType = wasteType;
  }

  get quantity(): string {
    return this._quantity;
  }

  set quantity(quantity: string) {
    this._quantity = quantity;
  }

  get location(): string {
    return this._location;
  }

  set location(location: string) {
    this._location = location;
  }

  get producer(): Producer {
    return this._producer;
  }

  set producer(producer: Producer) {
    this._producer = producer;
  }
  
}

export default Waste