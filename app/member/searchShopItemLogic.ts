import { useState, useEffect } from 'react';

// Interface for the flyer item
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

// Interface for the API response
interface SearchResponse {
  flyers: FlyerItem[];
}

export function useSearchShopItem(shopListId: string | undefined) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FlyerItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addItemError, setAddItemError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Effect to handle search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  // Function to handle the search
  const handleSearch = async (term: string) => {
    try {
      setIsSearching(true);
      setError(null);
      
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Make API call to search for flyers with authorization header
      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/search/flyers?searchName=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data: SearchResponse = await response.json();
      setSearchResults(data.flyers || []);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to make the PUT request to add item
  const addItemToShopList = async (requestBody: { item_name: string; brand_name?: string; extra_info?: string; thumbnail?: string }) => {
    if (!shopListId) return false;
    
    try {
      setIsAddingItem(true);
      setAddItemError(null);
      
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Submit PUT request to add item to the shop list
      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/shoplist/${shopListId}/item`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Failed to add item: ${response.status} ${response.statusText}`);
      }
      
      return true; // Return true to indicate success
      
    } catch (err) {
      console.error('Error adding item:', err);
      setAddItemError(err instanceof Error ? err.message : 'An error occurred while adding the item');
      return false; // Return false to indicate failure
    } finally {
      setIsAddingItem(false);
    }
  };

  // Function to handle adding item from search term
  const handleAddFromSearch = async () => {
    if (searchTerm.trim() === '') return false;
    
    const success = await addItemToShopList({
      item_name: searchTerm.trim()
    });
    
    if (success) {
      setSearchTerm('');
    }
    
    return success;
  };

  // Function to handle adding item from flyer
  const handleAddFromFlyer = async (flyerItem: FlyerItem) => {
    return await addItemToShopList({
      item_name: flyerItem.product_name,
      brand_name: flyerItem.brand,
      extra_info: flyerItem.description,
      thumbnail: flyerItem.image_url,
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    searchResults,
    error,
    isAddingItem,
    addItemError,
    handleAddFromSearch,
    handleAddFromFlyer
  };
} 