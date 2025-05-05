import { useState, useEffect } from 'react';
import type { UserProfile } from '../common/model/userprofile';
import { API_CONFIG, getApiUrl } from '../apiConfig';

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
  thumbnail: string;
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
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_BY_ID(id)), {
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

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_LEAVE(shopListId)), {
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

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_SHARE_CODE(shopListId)), {
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

  // Function to edit an item in the shop list
  const editItem = async (itemId: number, updatedData: { item_name?: string; brand_name?: string; extra_info?: string; is_bought?: boolean; thumbnail?: string }) => {
    if (!shopListId) return false;
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_ITEM(shopListId, itemId)), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Refresh the shop list to get the updated data
      await refreshShopList();
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    }
  };

  // Function to remove an item from the shop list
  const removeItem = async (itemId: number) => {
    if (!shopListId) return false;
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_ITEM(shopListId, itemId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Refresh the shop list to get the updated data
      await refreshShopList();
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
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
    requestShareCode,
    editItem,
    removeItem
  };
} 