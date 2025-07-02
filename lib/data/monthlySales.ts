// بيانات سجل المبيعات الشهرية
export const monthlySales = [
  { month: "يونيو 2025", total: 18435 },
  { month: "مايو 2025", total: 17040 },
  { month: "أبريل 2025", total: 16060 },
  { month: "مارس 2025", total: 15370 },
];

export function getMonthlySalesWithGrowth() {
  return monthlySales.map((s, i) => {
    let growth = "-";
    if (i < monthlySales.length - 1) {
      const prev = monthlySales[i + 1].total;
      if (prev > 0) {
        const percent = ((s.total - prev) / prev) * 100;
        growth = (percent > 0 ? "+" : "") + percent.toFixed(1) + "%";
      }
    }
    return { ...s, growth };
  });
}
