import { Account } from '../types';

interface AccountTreeProps {
  accounts: Account[];
  onDelete: (id: string) => Promise<boolean>;
}

export default function AccountTree({ accounts, onDelete }: AccountTreeProps) {
  // Filter root accounts (without parent)
  const rootAccounts = accounts.filter(acc => !acc.parentId);

  return (
    <div className="space-y-2">
      {rootAccounts.map(account => (
        <AccountNode 
          key={account._id}
          account={account}
          allAccounts={accounts}
          level={0}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface AccountNodeProps {
  account: Account;
  allAccounts: Account[];
  level: number;
  onDelete: (id: string) => Promise<boolean>;
}

function AccountNode({ account, allAccounts, level, onDelete }: AccountNodeProps) {
  // Find children of current account
  const children = allAccounts.filter(acc => acc.parentId === account._id);

  return (
    <div className={`ml-${level * 4}`}>
      <div className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600">
        <div>
          <span className="font-mono mr-2">{account.code}</span>
          <span>{account.name}</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onDelete(account._id)}
            className="text-red-400 hover:text-red-300"
          >
            حذف
          </button>
        </div>
      </div>
      
      {children.length > 0 && (
        <div className="mt-1 space-y-1">
          {children.map(child => (
            <AccountNode
              key={child._id}
              account={child}
              allAccounts={allAccounts}
              level={level + 1}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
