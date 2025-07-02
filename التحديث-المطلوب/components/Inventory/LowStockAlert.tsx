import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type LowStockAlertProps = {
  products: any[];
  onRestock: (id: string, newStock: number) => void;
};

export const LowStockAlert = ({ products, onRestock }: LowStockAlertProps) => {
  const lowStockProducts = products.filter(p => p.current_stock < 30);

  return (
    <Card className="paper-card">
      <CardHeader>
        <CardTitle>تنبيهات المخزون المنخفض</CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length > 0 ? (
          <div className="space-y-4">
            {lowStockProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center p-2 bg-red-50 border border-red-200 rounded"
              >
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-red-700">
                    متبقي {product.current_stock} وحدات فقط
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onRestock(product.id, product.current_stock + 1)}
                >
                  إعادة التخزين
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            لا توجد تنبيهات للمخزون المنخفض
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 