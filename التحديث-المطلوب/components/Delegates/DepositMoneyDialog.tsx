
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

const schema = z.object({
  amount: z.coerce.number().positive({ message: 'المبلغ يجب أن يكون أكبر من صفر' }),
  description: z.string().optional(),
});

type DepositMoneyFormValues = z.infer<typeof schema>;

interface DepositMoneyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  delegateId: string;
  delegateName: string;
  onSubmit: (data: DepositMoneyFormValues) => void;
}

export function DepositMoneyDialog({ isOpen, onClose, delegateId, delegateName, onSubmit }: DepositMoneyDialogProps) {
  const { toast } = useToast();

  const form = useForm<DepositMoneyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      description: '',
    },
  });

  const handleSubmit = (data: DepositMoneyFormValues) => {
    try {
      onSubmit(data);
    } catch (error) {
      toast({
        title: 'فشل توريد المبلغ',
        description: 'حدث خطأ أثناء تسجيل عملية التوريد',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>توريد مبلغ من المندوب: {delegateName}</DialogTitle>
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
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أي ملاحظات إضافية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-2 pt-6">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit">تأكيد التوريد</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
