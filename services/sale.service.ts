import { pool } from "@/lib/db";

export interface SaleData {
  productId: string;
  quantity: number;
  amount: number;
  date: string;
  branchId?: string;
}

/**
 * Creates a sale and a corresponding financial transaction in a single database transaction
 */
export async function createSale(data: SaleData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert into inventory transactions
    const saleResult = await client.query(`
      INSERT INTO transactions (product_id, quantity, type, date, branch_id)
      VALUES ($1, $2, 'sale', $3, $4)
      RETURNING id
    `, [data.productId, data.quantity, data.date, data.branchId]);

    const transactionId = saleResult.rows[0].id;

    // 2. Insert into financial transactions (income)
    await client.query(`
      INSERT INTO financial_transactions (type, amount, date, transaction_id)
      VALUES ('income', $1, $2, $3)
    `, [data.amount, data.date, transactionId]);

    await client.query("COMMIT");
    return { id: transactionId, ...data };

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction failed, rolled back:", err);
    throw err;
  } finally {
    client.release();
  }
}
