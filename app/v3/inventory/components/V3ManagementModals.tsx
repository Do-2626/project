// app/v3/inventory/components/V3ManagementModals.tsx
import React, { useState } from "react";
import { productService } from "@/services/productService";
import { branchService } from "@/services/branchService";
import { contactService } from "@/services/contactService";
import { Product, Branch, Contact } from "@/lib/schemas-v3";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";

interface ManagementProps {
  type: 'products' | 'branches' | 'suppliers';
  data: any[];
  onRefresh: () => void;
}

export const V3ManagementModals: React.FC<ManagementProps> = ({ type, data, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    setLoading(true);
    try {
      if (type === 'products') await productService.delete(id);
      if (type === 'branches') await branchService.delete(id);
      if (type === 'suppliers') await contactService.delete(id);
      onRefresh();
    } catch (err) {
      alert("خطأ أثناء الحذف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold">قائمة {type === 'products' ? 'المنتجات' : type === 'branches' ? 'الفروع' : 'الموردين'}</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="v3-btn-primary py-1 px-3 text-sm"
        >
          <Plus size={16} /> إضافة جديد
        </button>
      </div>

      {showAddForm && (
        <V3EntryForm
          type={type}
          onSuccess={() => { setShowAddForm(false); onRefresh(); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">الاسم</th>
              <th className="p-2">التفاصيل</th>
              <th className="p-2 w-20">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 font-semibold">{item.name}</td>
                <td className="p-2 text-gray-500">
                  {type === 'products' ? `${item.selling_price} SAR` : item.location || item.phone || '-'}
                </td>
                <td className="p-2 flex gap-2">
                  <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit2 size={14} /></button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const V3EntryForm = ({ type, onSuccess, onCancel }: any) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [extra, setExtra] = useState(""); // For price, location, or phone

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'products') {
        await productService.create({ name, selling_price: Number(extra), purchase_price: 0 });
      } else if (type === 'branches') {
        await branchService.create({ name, location: extra, is_active: true, settlement_type: 'daily' });
      } else if (type === 'suppliers') {
        await contactService.create({ name, phone: extra, type: 'supplier' });
      }
      onSuccess();
    } catch (err) {
      alert("خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border mb-4 space-y-3">
      <input
        required
        placeholder="الاسم..."
        className="v3-input"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        placeholder={type === 'products' ? "السعر..." : type === 'branches' ? "الموقع..." : "الهاتف..."}
        className="v3-input"
        value={extra}
        onChange={e => setExtra(e.target.value)}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="v3-btn-primary py-1 flex-1 justify-center">
          {loading ? <Loader2 className="animate-spin" size={16} /> : "حفظ"}
        </button>
        <button type="button" onClick={onCancel} className="bg-white border py-1 flex-1 rounded">إلغاء</button>
      </div>
    </form>
  );
};
