import { NextRequest, NextResponse } from 'next/server';
import FinancialTransaction from '@/models/FinancialTransaction';
import { dbConnect } from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const { date, branchId, sales, isWeekly } = await req.json();

        if (!date || !branchId || !sales) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        for (const sale of sales) {
            const { productId, amount, quantity } = sale;

            // Find existing sale for this branch, date, and product
            const query = {
                type: 'income',
                category: 'المبيعات',
                branchId: new mongoose.Types.ObjectId(branchId),
                date,
                productId: new mongoose.Types.ObjectId(productId)
            };

            const existing = await FinancialTransaction.findOne(query);

            if (existing) {
                existing.amount = amount;
                existing.quantity = quantity || 0;
                existing.description = isWeekly ? 'تسجيل مبيعات أسبوعية مجمعة للفرع' : 'تسجيل مبيعات فعلية يومية للفرع';
                await existing.save();
            } else if (amount > 0) {
                await FinancialTransaction.create({
                    type: 'income',
                    amount,
                    quantity: quantity || 0,
                    date,
                    branchId,
                    productId,
                    category: 'المبيعات',
                    description: isWeekly ? 'تسجيل مبيعات أسبوعية مجمعة للفرع' : 'تسجيل مبيعات فعلية يومية للفرع'
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error saving actual sales:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
