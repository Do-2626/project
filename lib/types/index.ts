// lib/types/index.ts

export interface CastData {
  _id: string;
  customerCode: number;
  monthDate: string;
  date: string;
  name: string;
  phone: string;
  k: number;
  t: number;
  installmentCount: number;
  otherProducts: string;
  advance: number;
  amount: number;
  installments: number;
  product: string;
  area: string;
  notes: string;
  collectedInstallmentNumber: number;
  printStatus: string;
  upcomingCollectionAmount: number;
  nextInstallment: number;
  piecePrice: number;
  status: string;
  column2: number;
  delayInMonths: number;
  paidFromNextInstallment: string;
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Add other interfaces as needed
