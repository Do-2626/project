// سجل عمليات سحب المنتجات بواسطة المناديب
// كل عملية: { id, delegateId, delegateName, date, items: [{ productId, productName, quantity }] }

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

// بيانات مبدئية (فارغة)
export let withdrawalsLog: DelegateWithdrawal[] = [];

export function addWithdrawalLog(entry: DelegateWithdrawal) {
  withdrawalsLog = [entry, ...withdrawalsLog];
}

export function getWithdrawalsLog() {
  return withdrawalsLog;
}

// إضافة دالة لإعادة تعيين السجل (اختياري)
export function resetWithdrawalsLog() {
  withdrawalsLog = [];
}
