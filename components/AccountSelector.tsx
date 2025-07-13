import React, { useEffect, useState } from 'react';

interface Account {
  _id: string;
  name: string;
  code: string;
  type: string;
}

interface Props {
  value: string;
  onChange: (accountId: string) => void;
  label: string;
}

const AccountSelector: React.FC<Props> = ({ value, onChange, label }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/finance/accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mb-2">
      <label className="block mb-1 text-sm font-medium text-gray-300">{label}</label>
      <select
        className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">اختر حساباً</option>
        {accounts.map(acc => (
          <option key={acc._id} value={acc._id}>
            {acc.name} ({acc.code})
          </option>
        ))}
      </select>
    </div>
  );
};

export default AccountSelector;