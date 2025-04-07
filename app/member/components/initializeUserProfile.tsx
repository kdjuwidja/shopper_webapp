import { useState, useEffect } from 'react';
import type { UserProfile } from '../memberHome';

interface InitializeUserProfileProps {
  onSubmit: (nickname: string, postalCode: string) => void;
  onCancel: () => void;
  userProfile?: UserProfile | null;
}

const isValidPostalCode = (code: string): boolean => {
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

export function InitializeUserProfile({ onSubmit, onCancel, userProfile }: InitializeUserProfileProps) {
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

  return (
    <div className="fixed inset-0 bg-black/75 dark:bg-black/90 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Welcome!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Please enter your details to continue:</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500 mb-4"
            />
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="Enter postal code (e.g., A1B2C3)"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 
                       text-gray-800 font-medium rounded-md 
                       transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white font-medium rounded-md 
                       transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 