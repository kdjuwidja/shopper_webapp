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
  available_stores: string[];
  flyer_details?: Array<{
    store: string;
    brand: string;
    product_name: string;
    description: string;
    disclaimer_text: string;
    original_price: number;
    pre_price_text: string;
    price_text: string;
    post_price_text: string;
    start_date: number;
    end_date: number;
  }>;
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
  // Check if we already have cached data
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
  const shoplists = Array.isArray(data.shoplists) 
    ? data.shoplists.map((item: any) => ({
        id: Number(item.id),
        name: String(item.name),
        owner: {
          id: String(item.owner.id),
          nickname: String(item.owner.nickname)
        },
        members: Array.isArray(item.members) 
          ? item.members.map((member: any) => ({
              id: String(member.id),
              nickname: String(member.nickname)
            }))
          : [],
        items: Array.isArray(item.items) 
          ? item.items.map((shopItem: any) => ({
              id: Number(shopItem.id),
              item_name: String(shopItem.name),
              brand_name: String(shopItem.brand_name || ''),
              extra_info: String(shopItem.extra_info || ''),
              is_bought: Boolean(shopItem.is_bought),
              available_stores: Array.isArray(shopItem.flyer) 
                ? [...new Set(shopItem.flyer.map((flyer: any) => String(flyer.store)))]
                : []
            }))
          : []
      }))
    : [];

  return shoplists;
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

  const data = await response.json();
  return {
    id: Number(data.id),
    name: String(data.name),
    owner: {
      id: String(data.owner.id),
      nickname: String(data.owner.nickname)
    },
    members: Array.isArray(data.members) 
      ? data.members.map((member: any) => ({
          id: String(member.id),
          nickname: String(member.nickname)
        }))
      : [],
    items: Array.isArray(data.items) 
      ? data.items.map((item: any) => ({
          id: Number(item.id),
          item_name: String(item.name),
          brand_name: String(item.brand_name || ''),
          extra_info: String(item.extra_info || ''),
          is_bought: Boolean(item.is_bought),
          available_stores: [],
          flyer_details: Array.isArray(item.flyer) ? item.flyer.map((flyer: any) => ({
            store: String(flyer.store),
            brand: String(flyer.brand),
            product_name: String(flyer.product_name),
            description: String(flyer.description),
            disclaimer_text: String(flyer.disclaimer_text),
            image_url: String(flyer.image_url),
            images: Array.isArray(flyer.images) ? flyer.images.map((img: any) => String(img)) : [],
            original_price: Number(flyer.original_price),
            pre_price_text: String(flyer.pre_price_text),
            price_text: String(flyer.price_text),
            post_price_text: String(flyer.post_price_text),
            start_date: flyer.start_date,
            end_date: flyer.end_date
          })) : []
        }))
      : []
  };
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

export async function addItemToShopList(shopListId: string, item: { item_name: string; brand_name?: string; extra_info?: string }): Promise<void> {
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

export async function editShopListItem(shopListId: number, itemId: number, updatedData: { item_name?: string; brand_name?: string; extra_info?: string; is_bought?: boolean }): Promise<void> {
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
    throw new Error('Failed to request share code');
  }

  return response.json();
}

export async function fetchShopListMembers(shopListId: number): Promise<ShopListMember[]> {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(getCoreUrl(API_CONFIG.ENDPOINTS.SHOPLIST_MEMBERS(shopListId)), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shop list members');
  }

  const data = await response.json();
  return Array.isArray(data.members) 
    ? data.members.map((member: any) => ({
        id: String(member.id),
        nickname: String(member.nickname)
      }))
    : [];
} 