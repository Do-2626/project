export interface IncomeStatementData {
  startDate: string;
  endDate: string;
  sales: number;
  otherIncome: number;
  totalIncome: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
  netProfit: number;
}




export interface IncomeStatementData {
  startDate: string;
  endDate: string;
  sales: number;
  otherIncome: number;
  totalIncome: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
  netProfit: number;
}

export interface TrendItem {
  label: string;    // اسم المقياس المراد تحليله (مثال: "المبيعات", "صافي الربح")
  current: number;  // القيمة الحالية لهذا المقياس
  previous: number; // القيمة السابقة لهذا المقياس
}