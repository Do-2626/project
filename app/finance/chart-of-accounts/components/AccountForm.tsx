import { useForm } from 'react-hook-form';
import { AccountFormValues, Account } from '../types';

interface AccountFormProps {
  onSubmit: (data: AccountFormValues) => Promise<boolean>;
  accounts: Account[];
}

export default function AccountForm({ onSubmit, accounts }: AccountFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormValues>();

  const handleFormSubmit = async (data: AccountFormValues) => {
    const success = await onSubmit(data);
    if (success) reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">الكود المحاسبي</label>
        <input
          {...register('code', { required: 'مطلوب' })}
          className="w-full bg-gray-700 rounded p-2"
          placeholder="1.1.1"
        />
        {errors.code && <p className="text-red-400 text-sm mt-1">{errors.code.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">اسم الحساب</label>
        <input
          {...register('name', { required: 'مطلوب' })}
          className="w-full bg-gray-700 rounded p-2"
        />
        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">نوع الحساب</label>
        <select
          {...register('type', { required: 'مطلوب' })}
          className="w-full bg-gray-700 rounded p-2"
        >
          <option value="asset">أصول</option>
          <option value="liability">خصوم</option>
          <option value="equity">حقوق ملكية</option>
          <option value="income">إيرادات</option>
          <option value="expense">مصروفات</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الحساب الأب</label>
        <select
          {...register('parentId')}
          className="w-full bg-gray-700 rounded p-2"
        >
          <option value="">لا يوجد</option>
          {accounts.map(account => (
            <option key={account._id} value={account._id}>
              {account.code} - {account.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الحالة</label>
        <select
          {...register('isActive')}
          className="w-full bg-gray-700 rounded p-2"
        >
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        حفظ الحساب
      </button>
    </form>
  );
}
