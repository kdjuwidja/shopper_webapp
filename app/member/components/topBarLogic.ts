import { useState } from 'react';
import type { UserProfile } from '../../common/model/userprofile';
import { InitializeUserProfile } from './initializeUserProfile';
import { createOrUpdateUserProfile} from '../../api/coreApiHandler';

export function useTopBar(
  initialUserProfile: UserProfile | null,
  onProfileUpdate?: (updatedProfile: UserProfile) => void
) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);
  const [showPostalCodeModal, setShowPostalCodeModal] = useState(false);

  const handleUpdate = () => {
    setShowPostalCodeModal(true);
  };

  const handleSubmit = async (nickname: string, postalCode: string) => {
    try {
      const updatedProfile = await createOrUpdateUserProfile(nickname, postalCode);
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
    handleSubmit,
    setShowPostalCodeModal,
  };
} 