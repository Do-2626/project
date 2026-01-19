import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import FinancialTransaction from "@/models/FinancialTransaction";
import Contact from "@/models/Contact";
import Branch from "@/models/Branch";

export async function GET() {
    try {
        // 1. Get unique parties from Transaction
        const parties1 = await Transaction.distinct("party");
        // 2. Get unique parties from FinancialTransaction
        const parties2 = await FinancialTransaction.distinct("party");
        // 3. Get all branches to exclude them
        const branches = await Branch.find({});
        const branchNames = branches.map(b => b.name);

        const allParties = Array.from(new Set([...parties1, ...parties2]))
            .filter(p => p && p.trim() !== "" && !branchNames.includes(p));

        let count = 0;
        for (const name of allParties) {
            const existing = await Contact.findOne({ name });
            if (!existing) {
                await Contact.create({ name, type: 'other' });
                count++;
            }
        }

        return NextResponse.json({ success: true, migratedCount: count });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
