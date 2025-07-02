import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, Coins, Archive } from "lucide-react";
import { Product } from "@/services/productService";

interface ProductCardProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export function ProductCard({ product, isOpen, onClose, onUpdateStock }: ProductCardProps) {
  const handleRestockProduct = () => {
    // اقتراح زيادة المخزون ب 20 وحدة
    const newStock = product.current_stock + 20;
    onUpdateStock(product.id, newStock);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl" aria-describedby="product-dialog-desc">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">بطاقة المنتج</DialogTitle>
        </DialogHeader>
        {/* وصف للحوار لتحسين الوصول */}
        <div id="product-dialog-desc" className="sr-only">
          تفاصيل المنتج، الاسم والوصف والسعر والمخزون وتاريخ آخر تحديث.
        </div>

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">{product.name}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Package className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <p className="font-semibold">الوصف:</p>
                  <p className="text-gray-600">{product.description || 'لا يوجد وصف'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">السعر:</p>
                  <p className="text-gray-600">{product.price} جم</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">المخزون الحالي:</p>
                  <p className={`${product.current_stock < 30 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    {product.current_stock} وحدة {product.current_stock < 30 && '(منخفض)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">آخر تحديث:</p>
                  <p className="text-gray-600">
                    {new Date(product.updated_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full ml-2"
              >
                إغلاق
              </Button>
              <Button 
                onClick={handleRestockProduct} 
                className="w-full mr-2"
                variant={product.current_stock < 30 ? "default" : "secondary"}
              >
                إعادة التخزين
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
