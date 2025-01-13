import mongoose from "mongoose";

const castSchema = new mongoose.Schema({
  customerCode: { type: Number },
  monthDate: { type: String },
  date: { type: String },
  name: { type: String },
  phone: { type: String },
  k: { type: Number },
  t: { type: Number },
  otherProducts: { type: String, default: "" },
  advance: { type: Number },
  amount: { type: Number },
  installments: { type: Number },
  product: { type: String },
  area: { type: String },
  notes: { type: String, default: "" },
  collectedInstallmentNumber: { type: Number },
  printStatus: { type: String, default: "" },
  upcomingCollectionAmount: { type: Number },
  nextInstallment: { type: Number },
  piecePrice: { type: Number },
  status: { type: String },
  column2: { type: Number },
  delayInMonths: { type: Number },
  paidFromNextInstallment: { type: String, default: "" },
  latitude: { type: Number },
  longitude: { type: Number },
});

export const Cast = mongoose.models.Cast || mongoose.model("Cast", castSchema);
