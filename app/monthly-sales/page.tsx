"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthlySalesWithGrowth } from "@/lib/data/monthlySales";

const MonthlySales = () => {
  const sales = getMonthlySalesWithGrowth();

  return (
    <div className="p-4">
      <Card className="paper-card">
        <CardHeader>
          <CardTitle>سجل المبيعات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">الشهر</th>
                  <th className="px-4 py-3 text-right">إجمالي المبيعات</th>
                  <th className="px-4 py-3 text-right">النمو</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{s.month}</td>
                    <td className="px-4 py-3">{s.total.toLocaleString()} ج.م</td>
                    <td className="px-4 py-3">{s.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlySales;
