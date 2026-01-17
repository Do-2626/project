import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import FinancialTransaction from '@/models/FinancialTransaction';
import { dbConnect } from '@/lib/mongoose';

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url!);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
        return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const filter = {
        date: { $gte: startDate, $lte: endDate }
    };

    try {
        const [inventoryTransactions, financialTransactions] = await Promise.all([
            Transaction.find(filter).populate('productId').populate('branchId').sort({ date: 1 }),
            FinancialTransaction.find({ ...filter, type: 'expense' }).populate('branchId').populate('expenseCategoryId').sort({ date: 1 })
        ]);

        const combined = [
            ...inventoryTransactions.map(t => t.toObject()),
            ...financialTransactions.map(f => ({
                ...f.toObject(),
                isFinancial: true,
                type: 'expense' // Ensure type is 'expense' for displaying icon/label
            }))
        ];

        // Final sort by date then by createdAt
        combined.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        return NextResponse.json(combined);
    } catch (error) {
        console.error("Failed to fetch weekly report", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
