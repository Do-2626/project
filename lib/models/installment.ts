import mongoose, { Schema, Document } from "mongoose";

export interface IInstallment extends Document {
  castId: string;
  dueDate: Date;
  amount: number;
  number: number;
  status: string;
  postponed?: boolean;
  paidAt?: Date | null;
  // snapshot لاسم العميل وقت إنشاء القسط (اختياري)
  castName?: string;
}

const InstallmentSchema = new Schema<IInstallment>(
  {
    castId: { type: String, required: true, ref: "Cast", index: true },
    dueDate: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    number: { type: Number, required: true, min: 1 },
    status: { type: String, required: true, default: "DUE", index: true },
    postponed: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    castName: { type: String }, // snapshot اختياري
  },
  { timestamps: true }
);

export const Installment =
  mongoose.models.Installment || mongoose.model<IInstallment>("Installment", InstallmentSchema);
