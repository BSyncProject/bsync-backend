import mongoose, { Schema, Document } from 'mongoose';
import { Collector, CollectorModel } from './Collector'; // Assuming Collector model is defined

// Define interface for Picker document
export interface Picker extends Document {
  name: string;
  address: string;
  phoneNumber: string;
  serviceArea: string;
  collector: Collector;
}

// Define Mongoose schema for Picker
const pickerSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  serviceArea: { type: String, required: true },
  collector: { type: Schema.Types.ObjectId, ref: 'Collector', required: true }, // Assuming Collector reference
});

// Create and export Mongoose model for Picker
export const PickerModel = mongoose.model<Picker>('Picker', pickerSchema);
