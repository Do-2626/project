import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddProductForm } from './AddProductForm';

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddProductDialog({ isOpen, onClose, onSubmit }: AddProductDialogProps) {
  const handleSubmit = (data: any) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl" aria-describedby="add-product-dialog-desc">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة منتج جديد</DialogTitle>
          <DialogDescription id="add-product-dialog-desc" className="text-center text-sm text-gray-500">
            أدخل بيانات المنتج الجديد لإضافته إلى المخزون
          </DialogDescription>
        </DialogHeader>
        <AddProductForm onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
