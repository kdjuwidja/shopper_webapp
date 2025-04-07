import { useState, useEffect } from 'react';
import type { UserProfile } from './memberHome';

export function useMemberHome() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPostalCodeModal, setShowPostalCodeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleUpdate = () => {
    setShowPostalCodeModal(true);
  };

  const createOrUpdateUserProfile = async (nickname: string, postalCode: string) => {
    try {
      if (userProfile && 
          userProfile.postal_code === postalCode && 
          userProfile.nickname === nickname) {
        setShowPostalCodeModal(false);
        return;
      }

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
     
      setUserProfile(prev => ({
        ...prev!,
        nickname: nickname,
        postal_code: postalCode
      }));
      setShowPostalCodeModal(false);
    } catch (error) {
      console.error('Error creating or updating user profile:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/user`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setShowPostalCodeModal(true);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return {
    userProfile,
    showPostalCodeModal,
    loading,
    handleUpdate,
    createOrUpdateUserProfile,
    setShowPostalCodeModal
  };
} 