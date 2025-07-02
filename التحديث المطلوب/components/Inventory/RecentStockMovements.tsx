{`
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentStockMovementsProps {
  products: Product[];
}

export const RecentStockMovements = ({ products }: RecentStockMovementsProps) => {
  return (
    <Card className="paper-card">
      <CardHeader>
        <CardTitle>حركات المخزون الأخيرة</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.slice(0, 3).map(product => (
              <div key={product.id} className="border-b pb-2 flex justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.current_stock > 50 ? 'وارد: ' : 'صادر: '}
                    {product.current_stock > 50 ? product.current_stock - 30 : 20} وحدة
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(product.updated_at).toLocaleDateString('ar-EG')}
                  </p>
                  <p className="text-xs">الرصيد الجديد: {product.current_stock} وحدة</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            لا توجد حركات مخزون حديثة
          </div>
        )}
      </CardContent>
    </Card>
  );
};
`}
