export interface Account {
  _id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentId?: string;
  balance: number;
  isActive: boolean;
  children?: Account[];
}

export interface AccountFormValues {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentId?: string;
  balance: number;
  isActive: boolean;
}
