import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import FinancialTransaction from '@/models/FinancialTransaction';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Aggregate monthly data
        const monthlyData: any = {};

        // 1. Aggregate Financial Transactions (Expenses and Other Income)
        const financialAggr = await FinancialTransaction.aggregate([
            {
                $project: {
                    year: { $substr: ["$date", 0, 4] },
                    month: { $substr: ["$date", 5, 2] },
                    type: 1,
                    amount: 1,
                    category: 1
                }
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month", type: "$type" },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        financialAggr.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            if (!monthlyData[key]) monthlyData[key] = { sales: 0, cogs: 0, expenses: 0, otherIncome: 0 };

            if (item._id.type === 'expense') {
                monthlyData[key].expenses += item.total;
            } else if (item._id.type === 'income' && item._id.category !== 'المبيعات') {
                monthlyData[key].otherIncome += item.total;
            }
        });

        // 2. Aggregate Inventory Transactions (Sales and COGS)
        // We need to join with Product to get prices if amount is not present
        const inventoryTransactions = await Transaction.find({
            type: { $in: ['outgoing', 'sale'] }
        }).populate('productId');

        inventoryTransactions.forEach((tx: any) => {
            const date = tx.date; // YYYY-MM-DD
            const key = date.substring(0, 7); // YYYY-MM
            if (!monthlyData[key]) monthlyData[key] = { sales: 0, cogs: 0, expenses: 0, otherIncome: 0 };

            const sellingPrice = tx.amount || (tx.productId?.sellingPrice * tx.quantity) || 0;
            const purchasePrice = (tx.productId?.purchasePrice * tx.quantity) || 0;

            monthlyData[key].sales += sellingPrice;
            monthlyData[key].cogs += purchasePrice;
        });

        // Format for response
        const result = Object.entries(monthlyData).map(([month, data]: any) => ({
            month,
            ...data,
            netProfit: (data.sales + data.otherIncome) - (data.cogs + data.expenses)
        })).sort((a, b) => b.month.localeCompare(a.month));

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Monthly report error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
