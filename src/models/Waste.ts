import mongoose, { Schema, Document } from 'mongoose';
import { Producer} from './Producer'; // Assuming Producer model is defined

export interface Waste extends Document {
  quantity: string;
  location: string;
  imageLink: string; 
  producer: Producer;
  majority: string;
}

const wasteSchema: Schema = new Schema({
  quantity: { type: String, required: true },
  location: { type: String, required: true },
  imageLink: { type: String},
  majority: { type: String, required: true },
  producer: { type: Schema.Types.ObjectId, ref: 'Producer', required: true },
});

export const WasteModel = mongoose.model<Waste>('Waste', wasteSchema);

