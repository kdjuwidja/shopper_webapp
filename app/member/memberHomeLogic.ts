import { useState, useEffect } from 'react';
import type { UserProfile } from '../common/model/userprofile';
import { API_CONFIG, getApiUrl } from '../apiConfig';

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

  const fetchShopLists = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_BASE), {
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

  const createShopList = async (name: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_BASE), {
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

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_LEAVE(id)), {
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

  const joinShopList = async (shareCode: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SHOPLIST_JOIN), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ share_code: shareCode })
      });

      if (!response.ok) {
        throw new Error('Failed to join shop list');
      }

      // Refresh the shop lists after joining
      await fetchShopLists();
    } catch (error) {
      console.error('Error joining shop list:', error);
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

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
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
    loading,
    createShopList,
    leaveShopList,
    fetchShopLists,
    setUserProfile,
    joinShopList
  };
}