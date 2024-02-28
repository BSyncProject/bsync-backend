import mongoose, { Schema, Document } from 'mongoose';
import { User} from './User'; // Assuming User model is defined
import { Waste, WasteModel } from './Waste'; // Assuming Waste model is defined

export interface Producer extends User, Document {
  waste: Waste[];
}

const producerSchema: Schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  waste: [{ type: Schema.Types.ObjectId, ref: 'Waste'}],
  address: {type: String, required: true}
});

export const ProducerModel = mongoose.model<Producer>('Producer', producerSchema);

