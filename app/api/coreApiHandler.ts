import { getCoreUrl, API_CONFIG } from './apiConfig';
import type { UserProfile } from '../common/model/userprofile';

export interface ShopListOwner {
  id: string;
  nickname: string;
}

export interface ShopListMember {
  id: string;
  nickname: string;
}

export interface ShopListItem {
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

export interface FlyerItem {
  store: string;
  brand: string;
  product_name: string;
  description: string;
  disclaimer_text: string;
  image_url: string;
  images: string[];
  original_price: number;
  pre_price_text: string;
  price_text: string;
  post_price_text: string;
  start_date: number;
  end_date: number;
}

export async function createOrUpdateUserProfile(nickname: string, postalCode: string): Promise<UserProfile> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), {
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
    throw new Error('Failed to update user profile');
  }

  const updatedProfile = await response.json();
  return updatedProfile;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

export async function fetchShopLists(): Promise<ShopList[]> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_BASE), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shop lists');
  }

  const data = await response.json();
  return Array.isArray(data.shoplists) 
    ? data.shoplists.map((item: any) => ({
        id: Number(item.id),
        name: String(item.name),
        owner: {
          id: String(item.owner.id),
          nickname: String(item.owner.nickname)
        }
      }))
    : [];
}

export async function createShopList(name: string): Promise<void> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_BASE), {
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
}

export async function leaveShopList(id: number): Promise<void> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_LEAVE(id)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to leave shop list');
  }
}

export async function joinShopList(shareCode: string): Promise<void> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_JOIN), {
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
}

export async function fetchShopList(id: number): Promise<ShopList> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_BY_ID(id)), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Shop list not found');
    }
    throw new Error('Failed to fetch shop list details');
  }

  return response.json();
}

export async function searchFlyers(searchTerm: string): Promise<FlyerItem[]> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SEARCH_FLYERS) + `?searchName=${encodeURIComponent(searchTerm)}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.flyers || [];
}

export async function addItemToShopList(shopListId: string, item: { item_name: string; brand_name?: string; extra_info?: string; thumbnail?: string }): Promise<void> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_ITEMS(shopListId)), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error(`Failed to add item: ${response.status} ${response.statusText}`);
  }
}

export async function editShopListItem(shopListId: number, itemId: number, updatedData: { item_name?: string; brand_name?: string; extra_info?: string; is_bought?: boolean; thumbnail?: string }): Promise<void> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_ITEM(shopListId, itemId)), {
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
}

export async function removeShopListItem(shopListId: number, itemId: number): Promise<void> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_ITEM(shopListId, itemId)), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to remove item');
  }
}

export async function requestShopListShareCode(shopListId: number): Promise<{ share_code: string }> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_SHARE_CODE(shopListId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to generate share code');
  }

  return response.json();
} 