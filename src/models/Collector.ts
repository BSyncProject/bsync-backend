import mongoose, { Schema, Document } from 'mongoose';
import { User } from './User'; 
import { Picker, PickerModel } from './Picker'; 

// Define interface for Collector document
export interface Collector extends User, Document {
  serviceArea: string;
  picker: Picker;
}

const collectorSchema: Schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  serviceArea: { type: String, required: true },
  picker: { type: Schema.Types.ObjectId, ref: 'Picker', required: true },
});

export const CollectorModel = mongoose.model<Collector>('Collector', collectorSchema);

