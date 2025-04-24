import { useState, useEffect } from 'react';
import type { UserProfile } from '../common/model/userprofile';

interface ShopListOwner {
  id: string;
  nickname: string;
}

export interface ShopList {
  id: number;
  name: string;
  owner: ShopListOwner;
}

export function useMemberHome() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [shopLists, setShopLists] = useState<ShopList[]>([]);
  const [showPostalCodeModal, setShowPostalCodeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleUpdate = () => {
    setShowPostalCodeModal(true);
  };

  const fetchShopLists = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/shoplist`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shop lists');
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      interface RawShopList {
        id: number;
        name: string;
        owner: {
          id: string;
          nickname: string;
        };
      }

      // Map the response data to our ShopList type
      const mappedShopLists: ShopList[] = Array.isArray(data.shoplists) 
        ? data.shoplists.map((item: RawShopList) => ({
            id: Number(item.id),
            name: String(item.name),
            owner: {
              id: String(item.owner.id),
              nickname: String(item.owner.nickname)
            }
          }))
        : [];

      console.log('Mapped shop lists:', mappedShopLists);
      setShopLists(mappedShopLists);
    } catch (error) {
      console.error('Error fetching shop lists:', error);
      setShopLists([]);
    }
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

  const createShopList = async (name: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/shoplist`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error('Failed to create shop list');
      }

      // Refresh the shop lists after creating a new one
      await fetchShopLists();
    } catch (error) {
      console.error('Error creating shop list:', error);
      throw error;
    }
  };

  const leaveShopList = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/shoplist/${id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave shop list');
      }

      // Refresh the shop lists after leaving
      await fetchShopLists();
    } catch (error) {
      console.error('Error leaving shop list:', error);
      throw error;
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
        // Fetch shop lists after user profile is loaded successfully
        await fetchShopLists();
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
    shopLists,
    showPostalCodeModal,
    loading,
    handleUpdate,
    createOrUpdateUserProfile,
    setShowPostalCodeModal,
    createShopList,
    leaveShopList
  };
} 