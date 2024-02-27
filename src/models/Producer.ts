import User from "./User";
import Waste from "./Waste";

class Producer extends User{

  private _waste: Waste

  constructor(){
    super();
    this._waste = new Waste();
  }

  set waste(waste: Waste){
    this._waste = waste
  }

  get waste(): Waste{
    return this._waste
  }
}

export default Producer