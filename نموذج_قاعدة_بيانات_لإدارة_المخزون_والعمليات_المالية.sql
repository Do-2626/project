DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP VIEW IF EXISTS daily_inventory_summary CASCADE;




-- 1. تفعيل إضافات UUID لإنشاء معرفات فريدة تلقائياً
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول أصناف المصاريف (Expense Categories)
-- مستوحى من موديل ExpenseCategory [7]
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    classification TEXT CHECK (classification IN ('تشغيلي', 'إداري', 'أخرى')) DEFAULT 'تشغيلي',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. جدول المنتجات (Products)
-- مستوحى من موديل Product [1]
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    weight TEXT,
    purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. جدول الفروع (Branches)
-- مستوحى من موديل Branch [2]
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    settlement_type TEXT CHECK (settlement_type IN ('daily', 'weekly')) DEFAULT 'daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول جهات الاتصال (Contacts)
-- مستوحى من موديل Contact [8]
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK (type IN ('customer', 'supplier', 'other')) DEFAULT 'other',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. جدول العمليات المخزنية (Transactions)
-- مستوحى من موديل Transaction [3]
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(12, 2) NOT NULL,
    type TEXT CHECK (type IN ('purchase', 'outgoing', 'incoming', 'damaged', 'expense', 'income', 'sale')) NOT NULL,
    party TEXT, 
    date DATE NOT NULL, -- استخدام نوع DATE بدلاً من String لتحسين الأداء [6]
    amount DECIMAL(12, 2),
    category TEXT,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. جدول العمليات المالية (Financial Transactions)
-- مستوحى من موديل FinancialTransaction [4]
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT CHECK (type IN ('expense', 'income', 'purchase')) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    party TEXT,
    date DATE NOT NULL,
    invoice_number TEXT,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity DECIMAL(12, 2),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    expense_category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    expense_subtype TEXT,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. إنشاء الفهارس (Indexes) لتحسين سرعة الاستعلامات والتقارير
-- هذه الفهارس تحل مشاكل الأداء في البحث عن العمليات حسب التاريخ [5, 6]
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_product_id ON transactions(product_id);
CREATE INDEX idx_transactions_branch_id ON transactions(branch_id);

CREATE INDEX idx_financial_date ON financial_transactions(date);
CREATE INDEX idx_financial_type ON financial_transactions(type);
CREATE INDEX idx_financial_branch_id ON financial_transactions(branch_id);

-- 9. إنشاء View لحساب التقرير اليومي (اختياري ولكنه مفيد للأداء)
-- هذا سيقلل من الحاجة لعمليات التجميع (Aggregations) المعقدة في الكود [9, 10]
CREATE VIEW daily_inventory_summary AS
SELECT 
    date,
    product_id,
    SUM(CASE WHEN type = 'purchase' OR type = 'incoming' THEN quantity ELSE 0 END) as total_in,
    SUM(CASE WHEN type = 'outgoing' OR type = 'damaged' OR type = 'sale' THEN quantity ELSE 0 END) as total_out
FROM transactions
GROUP BY date, product_id;


-- 1. إضافة جدول الأرصدة الافتتاحية (Snapshots)
-- هذا الجدول سيسمح لنا ببدء الحساب من تاريخ معين بدلاً من جرد كل شيء من البداية
CREATE TABLE IF NOT EXISTS inventory_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    quantity_on_hand DECIMAL(12, 2) DEFAULT 0,
    UNIQUE(snapshot_date, product_id, branch_id)
);

-- 2. إنشاء وظيفة الحساب المجمع (SQL Aggregation)
-- هذه الوظيفة ستنفذ الـ SUM و GROUP BY داخل قاعدة البيانات مباشرة
CREATE OR REPLACE FUNCTION get_inventory_summary_v2(
    p_start_date DATE, 
    p_end_date DATE, 
    p_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
    product_id UUID,
    qty_purchase DECIMAL,
    qty_sale DECIMAL,
    qty_incoming DECIMAL,
    qty_outgoing DECIMAL,
    qty_damaged DECIMAL,
    net_change DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.product_id,
        SUM(CASE WHEN t.type = 'purchase' THEN t.quantity ELSE 0 END) as qty_purchase,
        SUM(CASE WHEN t.type = 'sale' THEN t.quantity ELSE 0 END) as qty_sale,
        SUM(CASE WHEN t.type = 'incoming' THEN t.quantity ELSE 0 END) as qty_incoming,
        SUM(CASE WHEN t.type = 'outgoing' THEN t.quantity ELSE 0 END) as qty_outgoing,
        SUM(CASE WHEN t.type = 'damaged' THEN t.quantity ELSE 0 END) as qty_damaged,
        SUM(CASE 
            WHEN t.type IN ('purchase', 'incoming') THEN t.quantity 
            WHEN t.type IN ('sale', 'outgoing', 'damaged') THEN -t.quantity 
            ELSE 0 END) as net_change
    FROM transactions t
    WHERE t.date BETWEEN p_start_date AND p_end_date
      AND (p_branch_id IS NULL OR t.branch_id = p_branch_id)
    GROUP BY t.product_id;
END;
$$ LANGUAGE plpgsql;





ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- إضافة فهارس لتحسين أداء الترتيب في صفحة الإدارة المركزية
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
