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
  next: number;
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

export interface FormData {
  customerCode: number;
  monthDate: string;
  date: string;
  name: string;
  phone: string;
  k: number;
  t: number;
  otherProducts: string;
  advance: number;
  amount: number;
  installments: number;
  product: string;
  area: string;
  notes: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

export interface Product {
  id?: string;
  name: string;
  weight?: number;
  price_selling: number;
  purchase_price: number;
  current_stock: number;
  updated_at: string;
  created_at: string;
}

export interface Delegate {
  id?: string;
  name: string;
  phone?: string;
  capacity?: number;
  created_at?: string;
}

export interface WithdrawItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface DelegateActivationDialogProps {
  open: boolean;
  onClose: () => void;
  step: 'chooseDelegate' | 'chooseProducts' | null;
  setStep: (step: 'chooseDelegate' | 'chooseProducts' | null) => void;
  delegates: Delegate[];
  selectedDelegate: Delegate | null;
  onDelegateSelect: (delegate: Delegate) => void;
  withdrawItems: WithdrawItem[];
  products: Product[];
  onQuantityChange: (productId: string, value: number) => void;
  onConfirmWithdraw: () => void;
}

export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  description: string;
}

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
}

export interface IPayment {
  castId: string;
  number: number;
  amount: number;
  date: string;
}

export interface IInstallment {
  castId: string;
  dueDate: Date;
  amount: number;
  number: number;
  status: string;
  postponed?: boolean;
  paidAt?: Date | null;
  castName?: string;
}

export interface DelegateWithdrawal {
  id: string;
  delegateId: string;
  delegateName: string;
  date: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
}
