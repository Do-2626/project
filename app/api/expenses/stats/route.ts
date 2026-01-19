import { NextResponse } from "next/server";
import FinancialTransaction from "@/models/FinancialTransaction";
import { dbConnect } from "@/lib/mongoose";

export async function GET() {
    await dbConnect();
    try {
        const stats = await FinancialTransaction.aggregate([
            { $match: { type: 'expense' } },
            {
                $group: {
                    _id: {
                        categoryId: '$expenseCategoryId',
                        branchId: '$branchId'
                    },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $lookup: {
                    from: 'expensecategories',
                    localField: '_id.categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: '_id.branchId',
                    foreignField: '_id',
                    as: 'branch'
                }
            },
            {
                $project: {
                    categoryName: { $arrayElemAt: ['$category.name', 0] },
                    branchName: { $arrayElemAt: ['$branch.name', 0] },
                    totalAmount: 1
                }
            }
        ]);

        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
