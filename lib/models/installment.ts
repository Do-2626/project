import mongoose, { Schema, Document } from "mongoose";

export interface IInstallment extends Document {
  castId: string;
  dueDate: Date;
  amount: number;
  number: number;
  status: string;
  postponed?: boolean;
  paidAt?: Date | null;
}

const InstallmentSchema = new Schema<IInstallment>({
  castId: { type: String, required: true, ref: "Cast" },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  number: { type: Number, required: true },
  status: { type: String, required: true, default: "DUE" },
  postponed: { type: Boolean, default: false },
  paidAt: { type: Date, default: null },
});

export const Installment =
  mongoose.models.Installment || mongoose.model<IInstallment>("Installment", InstallmentSchema);
