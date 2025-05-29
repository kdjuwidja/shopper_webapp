import { TopBar } from './components/topBar';
import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import type { UserProfile } from '../common/model/userprofile';
import { useSearchShopItem } from './searchShopItemLogic';
import type { FlyerItem } from '../api/coreApiHandler';

export default function SearchShopItem() {
  // Get the shop list ID from the URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for user profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Get search functionality from the logic hook
  const {
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
  } = useSearchShopItem(id);

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  // Handle adding item and navigation
  const onAddFromSearch = async () => {
    const success = await handleAddFromSearch();
    if (success) {
      navigate(`/member/shoplist/${id}`);
    }
  };

  // Handle adding item from flyer and navigation
  const onAddFromFlyer = async (flyerItem: FlyerItem) => {
    console.log('Adding item from flyer:', flyerItem);
    const success = await handleAddFromFlyer(flyerItem);
    if (success) {
      navigate(`/member/shoplist/${id}`);
    }
  };

  // Format price with pre and post text
  const formatPrice = (preText: string, priceText: string, postText: string) => {
    if (!priceText) return 'Price not available';
    return `${preText}${priceText}${postText}`.trim() || 'Price not available';
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen">     
      <TopBar 
        key={userProfile?.id || 'no-profile'}
        initialUserProfile={userProfile} 
        onProfileUpdate={handleProfileUpdate}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => window.history.back()}
                  className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Go back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search Items
                </h1>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              {/* Search input */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for items..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 
                             dark:text-white"
                  />
                  <button
                    className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                      searchTerm.trim() === '' || isAddingItem
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={searchTerm.trim() === '' || isAddingItem}
                    onClick={onAddFromSearch}
                  >
                    {isAddingItem ? 'Adding...' : 'Add to List'}
                  </button>
                </div>
                {addItemError && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                    {addItemError}
                  </p>
                )}
              </div>

              {/* Active Flyers title */}
              {searchResults.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Active Flyers
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing results for "{debouncedSearchTerm}"
                  </p>
                </div>
              )}

              {/* Search results */}
              <div className="space-y-4">
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((item, index) => (
                      <div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                              {item.product_name}
                            </h3>
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                              {item.store}
                            </span>
                          </div>
                          {item.brand && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Brand: {item.brand}
                            </p>
                          )}
                          {item.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatPrice(item.pre_price_text, item.price_text, item.post_price_text)}
                            </span>
                            <button
                              className={`px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 
                                       text-white font-medium rounded-md 
                                       transition-colors duration-200
                                       ${isAddingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isAddingItem}
                              onClick={() => onAddFromFlyer(item)}
                            >
                              {isAddingItem ? 'Adding...' : 'Add to List'}
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Valid: {formatDate(item.start_date)} - {formatDate(item.end_date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : debouncedSearchTerm ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No results found for "{debouncedSearchTerm}"
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Search results will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 