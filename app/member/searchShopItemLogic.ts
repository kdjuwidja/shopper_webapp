import { useState, useEffect } from 'react';
import type { FlyerItem } from '../api/coreApiHandler';
import { searchFlyers, addItemToShopList } from '../api/coreApiHandler';

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
      const data = await searchFlyers(term);
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle adding item from search term
  const handleAddFromSearch = async () => {
    if (searchTerm.trim() === '') return false;
    
    try {
      setIsAddingItem(true);
      setAddItemError(null);
      await addItemToShopList(shopListId!, {
        item_name: searchTerm.trim()
      });
      setSearchTerm('');
      return true;
    } catch (err) {
      console.error('Error adding item:', err);
      setAddItemError(err instanceof Error ? err.message : 'An error occurred while adding the item');
      return false;
    } finally {
      setIsAddingItem(false);
    }
  };

  // Function to handle adding item from flyer
  const handleAddFromFlyer = async (flyerItem: FlyerItem) => {
    try {
      setIsAddingItem(true);
      setAddItemError(null);
      await addItemToShopList(shopListId!, {
        item_name: flyerItem.product_name,
        brand_name: flyerItem.brand,
        extra_info: flyerItem.description,
        thumbnail: flyerItem.image_url,
      });
      return true;
    } catch (err) {
      console.error('Error adding item:', err);
      setAddItemError(err instanceof Error ? err.message : 'An error occurred while adding the item');
      return false;
    } finally {
      setIsAddingItem(false);
    }
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