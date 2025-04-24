import { useState } from 'react';

export interface CreateShopListData {
  name: string;
}

export interface CreateShopListProps {
  onSubmit: (data: CreateShopListData) => void;
  onCancel: () => void;
}

export function useCreateShopList({ onSubmit, onCancel }: CreateShopListProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return {
    name,
    setName,
    handleSubmit,
    onCancel
  };
} 