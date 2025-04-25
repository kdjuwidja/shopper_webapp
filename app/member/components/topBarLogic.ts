import { useState } from 'react';
import type { UserProfile } from '../../common/model/userprofile';
import { InitializeUserProfile } from './initializeUserProfile';

export function useTopBar(
  initialUserProfile: UserProfile | null,
  onProfileUpdate?: (updatedProfile: UserProfile) => void
) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);
  const [showPostalCodeModal, setShowPostalCodeModal] = useState(false);

  const handleUpdate = () => {
    setShowPostalCodeModal(true);
  };

  const createOrUpdateUserProfile = async (nickname: string, postalCode: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          nickname: nickname,
          postal_code: postalCode 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create or update user profile');
      }

      const updatedProfile = {
        ...userProfile,
        nickname: nickname,
        postal_code: postalCode,
      } as UserProfile;
      
      setUserProfile(updatedProfile);
      setShowPostalCodeModal(false);
      
      // Call the callback if provided
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      // You might want to show an error message to the user here
    }
  };

  return {
    userProfile,
    showPostalCodeModal,
    handleUpdate,
    createOrUpdateUserProfile,
    setShowPostalCodeModal,
  };
} 