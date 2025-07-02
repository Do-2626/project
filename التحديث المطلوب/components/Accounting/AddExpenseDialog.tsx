
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { CashTransactionInput } from '@/services/delegateService';

const schema = z.object({
  amount: z.coerce.number().positive({ message: 'المبلغ يجب أن يكون أكبر من صفر' }),
  description: z.string().min(1, { message: 'الوصف مطلوب' }),
});

type AddExpenseFormValues = z.infer<typeof schema>;

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CashTransactionInput) => void;
}

export function AddExpenseDialog({ isOpen, onClose, onSubmit }: AddExpenseDialogProps) {
  const { toast } = useToast();

  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      description: '',
    },
  });

  const handleSubmit = (data: AddExpenseFormValues) => {
    try {
      const transaction: CashTransactionInput = {
        amount: data.amount,
        description: data.description,
        transaction_type: 'expense'
      };
      onSubmit(transaction);
    } catch (error) {
      toast({
        title: 'فشل تسجيل المصروف',
        description: 'حدث خطأ أثناء تسجيل المصروف',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تسجيل مصروف جديد</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (جم)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
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
                  <FormLabel>وصف المصروف</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أدخل وصف المصروف..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-2 pt-6">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit">تسجيل المصروف</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
