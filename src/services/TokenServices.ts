import { TokenModel} from '../models/Token';
import { v4 as uuidv4 } from 'uuid';


class TokenService {
  async addToken(token: string, email: string): Promise<void> {
    const createdAt = Date.now();
    await TokenModel.create({ value: token, createdAt: createdAt, createdFor: email });
  }

  async checkToken(token: string, email: string): Promise<boolean> {
    const existingToken = await TokenModel.findOneAndDelete({ value: token, createdFor: email});
    if (existingToken) {
      const now = Date.now();
      if (now - existingToken.createdAt <= 180000) { 
        TokenModel.deleteOne({value: existingToken.value})
        return true;
      }
    }
    return false;
  }

  async generateToken(): Promise<string> {
    const uuid = uuidv4().substr(0, 4);
    const token = parseInt(uuid, 16).toString().padStart(4, '0');
    return token;
  }
}

export default TokenService;
