import React from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Delegate, WithdrawItem, DelegateActivationDialogProps } from '@/lib/types';

interface Props extends DelegateActivationDialogProps {
  open: boolean;
  onClose: () => void;
}

const DelegateActivationDialog: React.FC<Props> = ({
  open,
  onClose,
  step,
  setStep,
  delegates,
  selectedDelegate,
  onDelegateSelect,
  withdrawItems,
  products,
  onQuantityChange,
  onConfirmWithdraw,
}) => {
  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          {step === 'chooseDelegate' && (
            <>
              <Dialog.Title className="mb-4 font-bold">اختر المندوب</Dialog.Title>
              <div className="space-y-2">
                {delegates.map(delegate => (
                  <Button key={delegate.id} className="w-full justify-between" onClick={() => onDelegateSelect(delegate)}>
                    <span>{delegate.name}</span>
                    <span className="text-xs text-gray-500">{delegate.phone}</span>
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={onClose}>إلغاء</Button>
              </div>
            </>
          )}
          {step === 'chooseProducts' && selectedDelegate && (
            <>
              <Dialog.Title className="mb-4 font-bold">تحديد الكميات المسحوبة ({selectedDelegate.name})</Dialog.Title>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {withdrawItems.map((item, idx) => {
                  const product = products.find(p => String(p.id ?? idx) === String(item.productId));
                  const maxQty = product?.current_stock || 0;
                  const isInvalid = item.quantity > maxQty;
                  return (
                    <div key={item.productId} className="flex items-center gap-2">
                      <span className="w-32">{item.productName}</span>
                      <Input
                        type="number"
                        min={0}
                        max={maxQty}
                        value={item.quantity}
                        onChange={e => {
                          let val = Math.max(0, Number(e.target.value));
                          if (val > maxQty) val = maxQty;
                          onQuantityChange(item.productId, val);
                        }}
                        className="w-20"
                      />
                      <span className="text-xs text-gray-400">المتوفر: {maxQty}</span>
                      {isInvalid && (
                        <span className="text-xs text-red-500 ml-2">الكمية المطلوبة أكبر من المتوفر</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={onConfirmWithdraw}>تأكيد السحب</Button>
                <Button variant="outline" onClick={onClose}>إلغاء</Button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DelegateActivationDialog;
