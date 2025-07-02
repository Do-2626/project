
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DelegateInput } from '@/services/delegateService';

const schema = z.object({
  name: z.string().min(1, { message: 'الاسم مطلوب' }),
  phone: z.string().optional(),
  route: z.string().optional(),
  balance: z.coerce.number().default(0),
});

type AddDelegateFormValues = z.infer<typeof schema>;

interface AddDelegateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DelegateInput) => void;
}

export function AddDelegateDialog({ isOpen, onClose, onSubmit }: AddDelegateDialogProps) {
  const { toast } = useToast();
  const form = useForm<AddDelegateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      route: '',
      balance: 0,
    },
  });

  const handleSubmit = (data: AddDelegateFormValues) => {
    try {
      onSubmit(data);
    } catch (error) {
      toast({
        title: 'فشل إضافة المندوب',
        description: 'حدث خطأ أثناء إضافة المندوب الجديد',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مندوب جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات المندوب الجديد ثم انقر على حفظ.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المندوب</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: أحمد محمد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input placeholder="0123456789" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>خط السير</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: المنطقة الشرقية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الرصيد الافتتاحي (جم)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-2 pt-6">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit">حفظ</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
