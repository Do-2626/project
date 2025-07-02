 
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        placeholder="البحث عن المنتجات..."
        className="pr-8"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
};
 
