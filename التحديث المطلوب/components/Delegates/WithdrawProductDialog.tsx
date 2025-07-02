import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/services/productService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductStock } from '@/services/productService';

const schema = z.object({
  product_id: z.string().min(1, { message: 'المنتج مطلوب' }),
  quantity: z.coerce.number().positive({ message: 'الكمية يجب أن تكون أكبر من صفر' }),
  total_price: z.coerce.number().positive({ message: 'السعر يجب أن يكون أكبر من صفر' }),
  notes: z.string().optional(),
});

type WithdrawProductFormValues = z.infer<typeof schema>;

interface WithdrawProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  delegateId: string;
  products: Product[];
  onSubmit: (data: WithdrawProductFormValues) => void;
}

export function WithdrawProductDialog({ isOpen, onClose, delegateId, products, onSubmit }: WithdrawProductDialogProps) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<WithdrawProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: '',
      quantity: 1,
      total_price: 0,
      notes: '',
    },
  });

  // تحديث إجمالي السعر عند تغيير المنتج أو الكمية
  useEffect(() => {
    const quantity = form.watch('quantity');
    
    if (selectedProduct && quantity) {
      const price = selectedProduct.selling_price || selectedProduct.price;
      form.setValue('total_price', price * quantity);
    }
  }, [selectedProduct, form.watch('quantity')]);

  // تحديد المنتج عند اختياره
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    
    if (product) {
      const price = product.selling_price || product.price;
      const quantity = form.getValues('quantity');
      form.setValue('total_price', price * quantity);
    }
  };

  // تحديث مخزون المنتج عند السحب
  const updateStockMutation = useMutation({
    mutationFn: ({ id, newStock }: { id: string; newStock: number }) => updateProductStock(id, newStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleSubmit = (data: WithdrawProductFormValues) => {
    try {
      // التحقق من كفاية المخزون
      if (selectedProduct && data.quantity > selectedProduct.current_stock) {
        toast({
          title: 'خطأ في المخزون',
          description: 'الكمية المطلوبة أكبر من المخزون المتوفر',
          variant: 'destructive',
        });
        return;
      }

      // تحديث المخزون بخصم الكمية المسحوبة
      if (selectedProduct) {
        updateStockMutation.mutate({
          id: selectedProduct.id,
          newStock: selectedProduct.current_stock - data.quantity,
        });
      }

      // إرسال بيانات الحركة
      onSubmit(data);
    } catch (error) {
      toast({
        title: 'فشل سحب المنتج',
        description: 'حدث خطأ أثناء تسجيل عملية السحب',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>سحب منتج للمندوب</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنتج</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleProductChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Array.isArray(products) ? products : []).map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - المخزون: {product.current_stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكمية</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      المخزون المتوفر: {selectedProduct.current_stock} وحدة
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر الإجمالي (جم)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      سعر الوحدة: {selectedProduct.selling_price || selectedProduct.price} جم
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أي ملاحظات إضافية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-4 pt-6">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit">تأكيد السحب</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
