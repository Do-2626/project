import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FormMessage } from '@/components/ui/form';
import { Product, updateProduct } from '@/services/productService';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  name: z.string().min(1, { message: 'الاسم مطلوب' }),
  description: z.string().min(1, { message: 'الوصف مطلوب' }),
  price: z.coerce.number().min(0.01, { message: 'السعر يجب أن يكون أكبر من 0' }),
  purchase_price: z.coerce.number().min(0, { message: 'سعر الشراء لا يمكن أن يكون سالبًا' }),
  selling_price: z.coerce.number().min(0, { message: 'سعر البيع لا يمكن أن يكون سالبًا' }),
  current_stock: z.coerce.number().min(0, { message: 'المخزون لا يمكن أن يكون سالبًا' }),
});

type EditProductFormValues = z.infer<typeof schema>;

interface EditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const EditProductDialog = ({ isOpen, onClose, product }: EditProductDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || '',
          price: product.price,
          purchase_price: product.purchase_price !== null ? product.purchase_price : 0,
          selling_price: product.selling_price !== null ? product.selling_price : 0,
          current_stock: product.current_stock,
        }
      : {
          name: '',
          description: '',
          price: 0,
          purchase_price: 0,
          selling_price: 0,
          current_stock: 0,
        },
  });

  const onSubmit = async (data: EditProductFormValues) => {
    if (!product) return;

    try {
      await updateProduct(product.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        purchase_price: data.purchase_price,
        selling_price: data.selling_price,
        current_stock: data.current_stock,
      });
      // تحديث حالة React Query لتحديث واجهة المستخدم
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم تعديل المنتج',
        description: 'تم تحديث بيانات المنتج بنجاح',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'فشل التعديل',
        description: 'حدث خطأ أثناء تحديث المنتج',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="edit-product-dialog-desc">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المنتج</DialogTitle>
          <DialogDescription>
            قم بتعديل التفاصيل المطلوبة وانقر على حفظ.
          </DialogDescription>
        </DialogHeader>
        <div id="edit-product-dialog-desc" className="sr-only">
          نموذج لتعديل بيانات المنتج الحالي في المخزون.
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المنتج</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: قلم رصاص" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea placeholder="مثال: قلم رصاص عادي 2B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchase_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر الشراء (بالجنيه)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selling_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر البيع (بالجنيه)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المخزون الحالي</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-4 pt-6">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit">حفظ التعديلات</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
