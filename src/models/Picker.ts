import mongoose, { Schema, Document } from 'mongoose';
import { Collector, CollectorModel } from './Collector'; 

export interface Picker extends Document {
  name: string;
  address: string;
  phoneNumber: string;
  serviceArea: string;
  collector: Collector;
}

const pickerSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  serviceArea: { type: String, required: true },
  collector: { type: Schema.Types.ObjectId, ref: 'Collector', required: true }, 
});

export const PickerModel = mongoose.model<Picker>('Picker', pickerSchema);
