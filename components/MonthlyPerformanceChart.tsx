'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineController,
    BarController,
    Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    LineController,
    BarController,
    Filler,
    Title,
    Tooltip,
    Legend
);

interface MonthlyData {
    month: string;
    sales: number;
    expenses: number;
    netProfit: number;
}

interface MonthlyPerformanceChartProps {
    data: MonthlyData[];
}

export default function MonthlyPerformanceChart({ data }: MonthlyPerformanceChartProps) {
    // Sort data of months for the chart (chronological order)
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));

    const labels = sortedData.map(d => d.month);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'المبيعات',
                data: sortedData.map(d => d.sales),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'المصروفات',
                data: sortedData.map(d => d.expenses),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'صافي الربح',
                data: sortedData.map(d => d.netProfit),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                type: 'bar' as const,
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'white',
                    font: { family: 'Cairo' },
                },
            },
            title: {
                display: true,
                text: 'أداء الشهور (المبيعات، المصاريف، الربحية)',
                color: 'white',
                font: { family: 'Cairo', size: 18 },
            },
        },
        scales: {
            y: {
                ticks: { color: 'white', font: { family: 'Cairo' } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            x: {
                ticks: { color: 'white', font: { family: 'Cairo' } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
        },
    };

    return (
        <div className="bg-[#1c2127] p-6 rounded-2xl border border-[#3b4754] shadow-2xl">
            <Chart type='line' data={chartData as any} options={options as any} />
        </div>
    );
}
