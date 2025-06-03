import { useState, useEffect } from 'react';
import type { UserProfile } from '../common/model/userprofile';
import type { ShopList } from '../api/coreApiHandler';
import { fetchUserProfile, fetchShopLists, createShopList, leaveShopList, joinShopList, createOrUpdateUserProfile } from '../api/coreApiHandler';

export function useMemberHome() {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [shopLists, setShopLists] = useState<ShopList[]>([]);
  const [loading, setLoading] = useState(true);

  // Wrapper function to handle both state and localStorage updates
  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('userProfile');
    }
  };

  const fetchShopListsState = async () => {
    try {
      const data = await fetchShopLists();
      setShopLists(data);

      // Extract item IDs from shop lists
      const itemIds = data.flatMap(list => list.items?.map(item => item.id) || []);
      if (itemIds.length > 0) {
        
      }
    } catch (error) {
      console.error('Error fetching shop lists:', error);
      setShopLists([]);
    }
  };

  const createShopListState = async (name: string) => {
    try {
      await createShopList(name);
      await fetchShopListsState();
    } catch (error) {
      console.error('Error creating shop list:', error);
      throw error;
    }
  };

  const leaveShopListState = async (id: number) => {
    try {
      await leaveShopList(id);
      await fetchShopListsState();
    } catch (error) {
      console.error('Error leaving shop list:', error);
      throw error;
    }
  };

  const joinShopListState = async (shareCode: string) => {
    try {
      await joinShopList(shareCode);
      await fetchShopListsState();
    } catch (error) {
      console.error('Error joining shop list:', error);
      throw error;
    }
  };

  const updateUserProfileState = async (nickname: string, postalCode: string) => {
    try {
      await createOrUpdateUserProfile(nickname, postalCode);
      // Fetch the updated profile to get all fields
      const updatedProfile = await fetchUserProfile();
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUserProfile(data);
        await fetchShopListsState();
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  return {
    userProfile,
    shopLists,
    loading,
    createShopList: createShopListState,
    leaveShopList: leaveShopListState,
    fetchShopLists: fetchShopListsState,
    joinShopList: joinShopListState,
    updateUserProfile: updateUserProfileState
  };
}