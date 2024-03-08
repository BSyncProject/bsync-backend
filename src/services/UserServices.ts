import { Collector, CollectorModel } from "../models/Collector";
import { Producer, ProducerModel } from "../models/Producer";
import EmailServices from "./EmailServices";
import TokenService from "./TokenServices";


const tokenService = new TokenService();
const emailService = new EmailServices()


class UserService{

  async checkUsername(username:string, role: string): Promise<String>{
    let foundUser;
    if(role === 'collector'){
      foundUser = await CollectorModel.findOne({username: username})
    } else{
      foundUser = await ProducerModel.findOne({username: username})
    }

    if(foundUser){ return "Username already taken"}
    else{ return "Username Confirmed and can be used"}
  }

  async forgotPassword(email:string, role: string) {

    const foundUser = await findUserByEmail(role, email);
    
    if(!foundUser){
      throw new Error("User not found");
    }
  
    const token = await tokenService.generateToken();
    const emailResponse = emailService.forgotPassword(email, foundUser.name, token);
    const createdToken = await tokenService.addToken(token, email);
  
    return emailResponse;
    
  }


  async resetPassword(email:string, token: string, newPassword:string, role:string){

    const tokenResponse = await tokenService.checkToken(token, email);
    if(tokenResponse !== true) {throw new Error("Invalid Token")};

    const foundUser = await findUserByEmail(role, email);
    
    if (!foundUser){
      throw new Error("User not found");
    }
    foundUser.password = newPassword;

    if(role === "collector"){
      CollectorModel.updateOne(foundUser.id, foundUser);
    } else{
      ProducerModel.updateOne(foundUser.id, foundUser);
    }
    return "successful"
  }
}

async function findUserByEmail(role: string, email: string) {
  let foundUser;
  if (role === 'collector') {
    foundUser = await CollectorModel.findOne({ email: email });
  } else {
    foundUser = await ProducerModel.findOne({ email: email });
  }
  return foundUser;
}


export default UserService;
