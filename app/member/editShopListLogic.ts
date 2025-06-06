import { useState, useEffect } from 'react';
import type { UserProfile } from '../common/model/userprofile';
import type { ShopList } from '../api/coreApiHandler';
import { fetchShopList, leaveShopList, requestShopListShareCode, editShopListItem, removeShopListItem } from '../api/coreApiHandler';

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

  // Function to fetch shop list data
  const fetchShopListData = async (id: number) => {
    try {
      const data = await fetchShopList(id);
      setShopList(data);
      return data;
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
      await fetchShopListData(shopListId);
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
      await fetchShopListData(shopListId);
      setLoading(false);
    }
  };

  // Function to leave a shop list
  const leaveShopListState = async () => {
    if (!shopListId) return false;
    
    try {
      await leaveShopList(shopListId);
      return true;
    } catch (error) {
      console.error('Error leaving shop list:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    }
  };

  // Function to request a share code for the shop list
  const requestShareCodeState = async () => {
    if (!shopListId) {
      throw new Error('No shop list ID provided');
    }
    
    try {
      const data = await requestShopListShareCode(shopListId);
      console.log('Share code generated:', data);
      return data;
    } catch (error) {
      console.error('Error generating share code:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    }
  };

  // Function to edit an item in the shop list
  const editItemState = async (itemId: number, updatedData: { item_name?: string; brand_name?: string; extra_info?: string; is_bought?: boolean; thumbnail?: string }) => {
    if (!shopListId) return false;
    
    try {
      await editShopListItem(shopListId, itemId, updatedData);
      await refreshShopList();
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    }
  };

  // Function to remove an item from the shop list
  const removeItemState = async (itemId: number) => {
    if (!shopListId) return false;
    
    try {
      await removeShopListItem(shopListId, itemId);
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
    leaveShopList: leaveShopListState,
    requestShareCode: requestShareCodeState,
    editItem: editItemState,
    removeItem: removeItemState
  };
} 