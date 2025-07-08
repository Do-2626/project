'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface IncomeStatementData {
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

interface IncomeStatementChartProps {
  data: IncomeStatementData;
}

export default function IncomeStatementChart({ data }: IncomeStatementChartProps) {
  // إعداد بيانات الرسم البياني للإيرادات والمصروفات
  const incomeExpenseData = {
    labels: ['الإيرادات', 'المصروفات'],
    datasets: [
      {
        label: 'القيمة',
        data: [data.totalIncome, data.totalExpenses],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // إعداد بيانات الرسم البياني التفصيلي للإيرادات
  const incomeBreakdownData = {
    labels: ['مبيعات المنتجات', 'إيرادات أخرى'],
    datasets: [
      {
        label: 'تفاصيل الإيرادات',
        data: [data.sales, data.otherIncome],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // إعداد بيانات الرسم البياني التفصيلي للمصروفات
  const expenseBreakdownData = {
    labels: ['تكلفة البضاعة المباعة', 'مصروفات تشغيلية', 'مصروفات أخرى'],
    datasets: [
      {
        label: 'تفاصيل المصروفات',
        data: [data.costOfGoodsSold, data.operatingExpenses, data.otherExpenses],
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // خيارات الرسم البياني العمودي
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          font: {
            family: 'Cairo',
          },
        },
      },
      title: {
        display: true,
        text: 'مقارنة الإيرادات والمصروفات',
        color: 'white',
        font: {
          family: 'Cairo',
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white',
          font: {
            family: 'Cairo',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'white',
          font: {
            family: 'Cairo',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  // خيارات الرسم البياني الدائري
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'white',
          font: {
            family: 'Cairo',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw.toFixed(2);
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-6 text-center text-white border-b border-gray-700 pb-2">
        الرسوم البيانية
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <Bar data={incomeExpenseData} options={barOptions} />
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center text-green-400">تفاصيل الإيرادات</h3>
            <Pie data={incomeBreakdownData} options={pieOptions} />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-center text-red-400">تفاصيل المصروفات</h3>
        <Pie data={expenseBreakdownData} options={pieOptions} />
      </div>
      
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">صافي الربح</h3>
          <span className={`text-xl font-bold ${data.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.netProfit.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 h-4 bg-gray-600 rounded-full overflow-hidden">
          {data.netProfit >= 0 ? (
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${Math.min(100, (data.netProfit / data.totalIncome) * 100)}%` }}
            />
          ) : (
            <div 
              className="h-full bg-red-500" 
              style={{ width: '100%' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}