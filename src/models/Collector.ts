import Picker from "./Picker";
import User from "./User";

class Collector extends User {

  private _serviceArea: string
  private _picker: Picker

  constructor(){
    super()
    this._serviceArea = "";
    this._picker = new Picker();
  }

  set serviceArea(serviceArea: string){
    this._serviceArea = serviceArea;
  }

  get serviceArea(): string{
    return this._serviceArea
  }

  set picker(picker: Picker){
    this._picker = picker;
  }
  
}

export default Collector;
