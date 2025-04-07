import { useState, useEffect } from 'react';
import type { UserProfile } from '../memberHome';

interface UseInitializeUserProfileProps {
  onSubmit: (nickname: string, postalCode: string) => void;
  onCancel: () => void;
  userProfile?: UserProfile | null;
}

export const isValidPostalCode = (code: string): boolean => {
  if (code.length !== 6) return false;
  
  for (let i = 0; i < code.length; i++) {
    if (i % 2 === 0) { // odd position (0-based index)
      if (!/[A-Z]/.test(code[i])) return false;
    } else { // even position
      if (!/[0-9]/.test(code[i])) return false;
    }
  }
  return true;
};

export function useInitializeUserProfile({ onSubmit, onCancel, userProfile }: UseInitializeUserProfileProps) {
  const [nickname, setNickname] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile) {
      setNickname(userProfile.nickname);
      setPostalCode(userProfile.postal_code);
    }
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) {
      setError('Please enter a nickname');
      return;
    }
    if (!isValidPostalCode(postalCode)) {
      setError('Invalid postal code format. Must be 6 characters with letters in odd positions and numbers in even positions (e.g., A1B2C3)');
      return;
    }
    setError('');
    onSubmit(nickname, postalCode);
  };

  return {
    nickname,
    setNickname,
    postalCode,
    setPostalCode,
    error,
    handleSubmit,
    onCancel
  };
} 