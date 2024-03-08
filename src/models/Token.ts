import { string } from 'joi';
import mongoose, { Schema } from 'mongoose';

interface Token extends Document {
  value: string;
  createdAt: number;
  createdFor: string;
}

const TokenSchema = new Schema<Token>({
  value: { type: String, required: true },
  createdAt: { type: Number, required: true },
  createdFor: {type: String, required: true}
});

const TokenModel = mongoose.model<Token>('Token', TokenSchema);

export { Token, TokenModel};