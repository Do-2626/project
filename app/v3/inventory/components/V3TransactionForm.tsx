// app/v3/inventory/components/V3TransactionForm.tsx
import React, { useState } from "react";
import { transactionService } from "@/services/transactionService";
import { Product, Branch } from "@/lib/schemas-v3";
import { Loader2 } from "lucide-react";

interface V3TransactionFormProps {
  type: 'purchase' | 'outgoing' | 'incoming' | 'damaged';
  products: Product[];
  branches: Branch[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const V3TransactionForm: React.FC<V3TransactionFormProps> = ({ 
  type, 
  products, 
  branches, 
  onSuccess, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: 1,
    branch_id: "",
    party: "",
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: "",
  });

  const titles = {
    purchase: "إضافة بضاعة من مورد",
    outgoing: "سحب بضاعة لفرع",
    incoming: "إرجاع بضاعة من فرع",
    damaged: "خصم بضاعة تالفة"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await transactionService.create({
        ...formData,
        type,
        quantity: Number(formData.quantity),
        amount: Number(formData.amount) || undefined,
        branch_id: (type === 'outgoing' || type === 'incoming') ? formData.branch_id : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ العملية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4 text-center">{titles[type]}</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">المنتج</label>
        <select 
          required
          className="v3-input"
          value={formData.product_id}
          onChange={e => setFormData({...formData, product_id: e.target.value})}
        >
          <option value="">اختر المنتج...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">الكمية</label>
          <input 
            type="number" 
            step="0.01"
            required
            className="v3-input v3-number"
            value={formData.quantity}
            onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">التاريخ</label>
          <input 
            type="date" 
            required
            className="v3-input"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
      </div>

      {(type === 'outgoing' || type === 'incoming') && (
        <div>
          <label className="block text-sm font-semibold mb-1">الفرع</label>
          <select 
            required
            className="v3-input"
            value={formData.branch_id}
            onChange={e => setFormData({...formData, branch_id: e.target.value})}
          >
            <option value="">اختر الفرع...</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {type === 'purchase' && (
        <div>
          <label className="block text-sm font-semibold mb-1">المورد / المصدر</label>
          <input 
            type="text" 
            className="v3-input"
            placeholder="اسم المورد..."
            value={formData.party}
            onChange={e => setFormData({...formData, party: e.target.value})}
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="v3-btn-primary flex-1 justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "حفظ العملية"}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 bg-gray-100 py-2 rounded-lg font-semibold"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};
