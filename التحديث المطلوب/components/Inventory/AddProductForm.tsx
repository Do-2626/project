
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// مخطط التحقق من البيانات
const formSchema = z.object({
  name: z.string().min(2, { message: "اسم المنتج مطلوب" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "السعر الأساسي يجب أن يكون صفرًا أو أكثر" }),
  purchase_price: z.coerce.number().min(0, { message: "سعر الشراء يجب أن يكون صفرًا أو أكثر" }),
  selling_price: z.coerce.number().min(0, { message: "سعر البيع يجب أن يكون صفرًا أو أكثر" }),
  current_stock: z.coerce.number().min(0, { message: "الكمية يجب أن تكون صفرًا أو أكثر" }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddProductFormProps {
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

export function AddProductForm({ onSubmit, onCancel }: AddProductFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      purchase_price: 0,
      selling_price: 0,
      current_stock: 0,
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    toast({
      title: "تم إضافة المنتج",
      description: `تمت إضافة ${data.name} إلى المخزون`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المنتج</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم المنتج" {...field} />
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
              <FormLabel>وصف المنتج</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="أدخل وصف المنتج (اختياري)" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السعر الأساسي (جم)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0" 
                  placeholder="أدخل السعر الأساسي بالجنيه المصري" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
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
              <FormLabel>سعر الشراء (جم)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0" 
                  placeholder="أدخل سعر الشراء بالجنيه المصري" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
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
              <FormLabel>سعر البيع (جم)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0" 
                  placeholder="أدخل سعر البيع بالجنيه المصري" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
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
              <FormLabel>الكمية المتوفرة</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  placeholder="أدخل الكمية" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit">حفظ المنتج</Button>
        </div>
      </form>
    </Form>
  );
}
