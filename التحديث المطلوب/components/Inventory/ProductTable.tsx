import React from 'react';
import { Product } from '@/services/productService';
import { Button } from '@/components/ui/button';

interface ProductTableProps {
  products: Product[];
  handleRestockProduct: (id: string, newStock: number) => void;
  handleViewProduct: (product: Product) => void;
  handleEditProduct: (product: Product) => void;
}

export const ProductTable = ({ products, handleRestockProduct, handleViewProduct, handleEditProduct }) => {
  return (
    <table className="w-full text-sm">
      <thead className="bg-muted text-muted-foreground">
        <tr>
          <th className="px-4 py-3 text-right">اسم المنتج</th>
          <th className="px-4 py-3 text-right">الوصف</th>
          <th className="px-4 py-3 text-right">السعر</th>
          <th className="px-4 py-3 text-right">المخزون الحالي</th>
          <th className="px-4 py-3 text-right">آخر تحديث</th>
          <th className="px-4 py-3 text-right">الإجراءات</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {products.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
              لا توجد منتجات مطابقة للبحث
            </td>
          </tr>
        ) : (
          products.map((product) => (
            <tr key={product.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3">{product.description || '-'}</td>
              <td className="px-4 py-3">{product.price} جم</td>
              <td className="px-4 py-3">{product.current_stock} وحدة</td>
              <td className="px-4 py-3">{new Date(product.updated_at).toLocaleDateString('ar-EG')}</td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProduct(product)}
                  >
                    عرض البطاقة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestockProduct(product.id, product.current_stock + 1)}
                  >
                    إعادة التخزين
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    تعديل
                  </Button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
