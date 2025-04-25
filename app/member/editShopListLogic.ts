import { useState, useEffect } from 'react';
import type { UserProfile } from '../common/model/userprofile';

interface ShopListMember {
  id: string;
  nickname: string;
}

interface ShopListOwner {
  id: string;
  nickname: string;
}

interface ShopListItem {
  id: number;
  item_name: string;
  brand_name: string;
  extra_info: string;
  is_bought: boolean;
}

export interface ShopList {
  id: number;
  name: string;
  owner: ShopListOwner;
  members: ShopListMember[];
  items: ShopListItem[];
}

export function useEditShopList(shopListId: number | null) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [shopList, setShopList] = useState<ShopList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapper function to handle both state and localStorage updates
  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('userProfile');
    }
  };

  // Load user profile from localStorage
  useEffect(() => {
    const loadUserProfile = () => {
      console.log('Loading user profile from localStorage');
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          console.log('User profile loaded:', parsedProfile);
          setUserProfile(parsedProfile);
        } catch (e) {
          console.error('Failed to parse user profile from localStorage', e);
        }
      } else {
        console.log('No user profile found in localStorage');
      }
    };

    loadUserProfile();
  }, []);

  // Refresh shop list when user profile is loaded
  useEffect(() => {
    if (userProfile && shopListId) {
      console.log('User profile loaded, refreshing shop list');
      refreshShopList();
    }
  }, [userProfile]);

  // Function to fetch shop list data
  const fetchShopList = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Fetch shop list details
      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/shoplist/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Shop list not found');
        } else {
          throw new Error('Failed to fetch shop list details');
        }
        return null;
      }

      // Directly assign the JSON response to our ShopList interface
      const data = await response.json();
      setShopList(data as ShopList);
      return data as ShopList;
    } catch (error) {
      console.error('Error fetching shop list:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return null;
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      if (!shopListId) {
        setError('No shop list ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      await fetchShopList(shopListId);
      setLoading(false);
    };

    loadData();
  }, [shopListId]);

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    console.log('Updating user profile:', updatedProfile);
    setUserProfile(updatedProfile);
  };

  // Function to refresh shop list data
  const refreshShopList = async () => {
    if (shopListId) {
      setLoading(true);
      await fetchShopList(shopListId);
      setLoading(false);
    }
  };

  // Function to leave a shop list
  const leaveShopList = async () => {
    if (!shopListId) return false;
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/shoplist/${shopListId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave shop list');
      }

      return true;
    } catch (error) {
      console.error('Error leaving shop list:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    }
  };

  // Function to request a share code for the shop list
  const requestShareCode = async () => {
    if (!shopListId) {
      throw new Error('No shop list ID provided');
    }
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/shoplist/${shopListId}/share-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate share code');
      }

      const data = await response.json();
      console.log('Share code generated:', data);
      return { share_code: data.share_code };
    } catch (error) {
      console.error('Error generating share code:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    }
  };

  return {
    userProfile,
    shopList,
    loading,
    error,
    handleProfileUpdate,
    refreshShopList,
    leaveShopList,
    requestShareCode
  };
} 