import mongoose from "mongoose";

const castSchema = new mongoose.Schema(
  {
    customerCode: { type: Number, required: true, index: true },
    monthDate: { type: String },
    date: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    k: { type: Number },
    t: { type: Number },
    otherProducts: { type: String, default: "" },
    advance: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 1 },
    installments: { type: Number, required: true, min: 1 },
    product: { type: String, required: true },
    area: { type: String, required: true, index: true },
    notes: { type: String, default: "" },
    collectedInstallmentNumber: { type: Number },
    printStatus: { type: String, default: "" },
    upcomingCollectionAmount: { type: Number },
    nextInstallment: { type: Number },
    next: { type: Number },
    piecePrice: { type: Number },
    status: { type: String, default: "active", index: true },
    column2: { type: Number },
    delayInMonths: { type: Number },
    paidFromNextInstallment: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

export const Cast = mongoose.models.Cast || mongoose.model("Cast", castSchema);
