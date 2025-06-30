import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IPayment extends Document {
  castId: string;
  number: number;
  amount: number;
  date: string;
}

const PaymentSchema = new Schema<IPayment>({
  castId: { type: String, required: true, index: true },
  number: { type: Number, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
});

// Prevent model overwrite in dev
export const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);
