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
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/productService';

const schema = z.object({
  product_id: z.string().min(1, { message: 'يجب اختيار منتج' }),
  customer_name: z.string().min(1, { message: 'اسم العميل مطلوب' }),
  quantity: z.coerce.number().positive({ message: 'الكمية يجب أن تكون أكبر من صفر' }),
  total_price: z.coerce.number().positive({ message: 'المبلغ يجب أن يكون أكبر من صفر' }),
  notes: z.string().optional(),
});

type AddSaleFormValues = z.infer<typeof schema>;

interface AddSaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddSaleFormValues) => void;
  delegateId: string;
}

export function AddSaleDialog({ isOpen, onClose, onSubmit, delegateId }: AddSaleDialogProps) {
  const { toast } = useToast();
  const [selectedProductPrice, setSelectedProductPrice] = useState<number>(0);

  // استعلام المنتجات
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const form = useForm<AddSaleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: '',
      customer_name: '',
      quantity: 1,
      total_price: 0,
      notes: '',
    },
  });

  const watchProductId = form.watch('product_id');
  const watchQuantity = form.watch('quantity');

  // تحديث سعر المنتج عند اختيار منتج
  useEffect(() => {
    if (watchProductId) {
      const product = products.find(p => p.id === watchProductId);
      if (product && product.selling_price) {
        setSelectedProductPrice(product.selling_price);
        form.setValue('total_price', product.selling_price * (watchQuantity || 1));
      }
    }
  }, [watchProductId, products, form, watchQuantity]);

  // تحديث السعر الإجمالي عند تغيير الكمية
  useEffect(() => {
    if (watchProductId && watchQuantity > 0) {
      form.setValue('total_price', selectedProductPrice * watchQuantity);
    }
  }, [watchQuantity, selectedProductPrice, form]);

  const handleSubmit = (data: AddSaleFormValues) => {
    try {
      onSubmit(data);
    } catch (error) {
      toast({
        title: 'فشل تسجيل فاتورة المبيعات',
        description: 'حدث خطأ أثناء تسجيل الفاتورة',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]" aria-describedby="add-sale-dialog-desc">
        <DialogHeader>
          <DialogTitle>تسجيل فاتورة مبيعات جديدة</DialogTitle>
        </DialogHeader>
        {/* وصف للحوار لتحسين الوصول */}
        <div id="add-sale-dialog-desc" className="sr-only">
          نموذج تسجيل فاتورة مبيعات جديدة، اختر المنتج وأدخل بيانات العميل والكمية والمبلغ.
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنتج</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.selling_price} جم
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
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العميل</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم العميل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
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
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ملاحظات إضافية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-4 pt-6">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit">تسجيل الفاتورة</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
