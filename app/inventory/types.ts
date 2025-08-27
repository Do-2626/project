export interface Transaction {
  _id: string;
  productId: { name: string };
  quantity: number;
  type: string;
  party?: string;
  date?: string | number;
}
export interface Product {
  _id: string;
  name: string;
  weight?: string;
  purchasePrice: number;
  sellingPrice: number;
}

export interface DailyLogProps {
  report: any[];
  during: any;
  iconMap?: {
    purchase?: React.ReactNode;
    outgoing?: React.ReactNode;
    incoming?: React.ReactNode;
    damaged?: React.ReactNode;
  };
}

export type NotificationType = "success" | "error";

export interface NotificationState {
  type: NotificationType;
  message: string;
}