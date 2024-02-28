import mongoose, { Schema, Document } from 'mongoose';
import { User } from './User'; 
import { Picker, PickerModel } from './Picker'; 

export interface Collector extends User, Document {
  serviceArea: string;
  picker: Picker[];
  isAgent: boolean
}

const collectorSchema: Schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  serviceArea: { type: String, required: true },
  picker: [{ type: Schema.Types.ObjectId, ref: 'Picker'}],
  isAgent: {type: Boolean, default: false},
  address: {type: String, required: true},
});

export const CollectorModel = mongoose.model<Collector>('Collector', collectorSchema);
