import { TopBar } from './components/topBar';
import { useEditShopList } from './editShopListLogic';
import type { UserProfile } from '../common/model/userprofile';
import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from './components/confirmDialog';
import { EditItemDialog } from './components/editItemDialog';
import { fetchShopListMembers, type ShopListMember } from '../api/coreApiHandler';

export interface ShopListItem {
  id: number;
  name: string;
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

export default function EditShopList() {
  // Get the shop list ID from the URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
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
  } = useEditShopList(id ? parseInt(id) : null);

  // State for confirm dialog
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [members, setMembers] = useState<ShopListMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<{
    id: number;
    item_name: string;
    brand_name: string;
    extra_info: string;
  } | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Debug log to check if userProfile is available
  useEffect(() => {
    console.log('User profile in EditShopList:', userProfile);
  }, [userProfile]);

  // Handle profile update and refresh shop list
  const handleProfileUpdateAndRefresh = (updatedProfile: UserProfile) => {
    handleProfileUpdate(updatedProfile);
    refreshShopList();
  };

  // Handle leaving the shop list
  const handleLeaveShopList = async () => {
    const success = await leaveShopList();
    if (success) {
      const basename = import.meta.env.VITE_BASE_PATH || '';
      window.location.href = `${basename}/member`;
    }
  };

  // Handle generating a share code
  const handleShareShopList = async () => {
    try {
      const result = await requestShareCode();
      setShareCode(result.share_code);
      setShowShareDialog(true);
    } catch (error) {
      console.error('Error generating share code:', error);
    }
  };

  // Handle navigation to search page
  const handleAddItem = () => {
    navigate(`/member/searchshopitem/${id}`);
  };

  // Handle editing an item
  const handleEditItem = (itemId: number, updatedData?: { is_bought?: boolean }) => {
    if (updatedData) {
      // If updatedData is provided, update the item directly
      editItem(itemId, updatedData);
    } else {
      // Find the item to edit
      const item = shopList?.items.find(item => item.id === itemId);
      if (item) {
        setItemToEdit({
          id: item.id,
          item_name: item.item_name,
          brand_name: item.brand_name || '',
          extra_info: item.extra_info || ''
        });
        setShowEditDialog(true);
      }
    }
  };

  // Handle saving edited item
  const handleSaveEditedItem = (updatedData: { item_name: string; brand_name: string; extra_info: string }) => {
    if (itemToEdit) {
      editItem(itemToEdit.id, updatedData);
      setShowEditDialog(false);
      setItemToEdit(null);
    }
  };

  // Handle removing an item
  const handleRemoveItem = (itemId: number) => {
    setItemToRemove(itemId);
    setShowRemoveConfirm(true);
  };

  // Handle confirming item removal
  const handleConfirmRemoveItem = async () => {
    if (itemToRemove) {
      const success = await removeItem(itemToRemove);
      if (success) {
        setShowRemoveConfirm(false);
        setItemToRemove(null);
      }
    }
  };

  // Handle viewing members
  const handleViewMembers = async () => {
    if (!id) return;
    
    setIsLoadingMembers(true);
    setMembersError(null);
    try {
      const fetchedMembers = await fetchShopListMembers(parseInt(id));
      setMembers(fetchedMembers);
      setShowMembersDialog(true);
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : 'Failed to fetch members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Check if current user is the owner
  const isOwner = userProfile && shopList && userProfile.id === shopList.owner.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">
          <h1 className="text-xl font-semibold">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!shopList) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">
          <h1 className="text-xl font-semibold">Shop List Not Found</h1>
          <p>The requested shop list could not be found.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      {/* Always render the TopBar */}
      <TopBar 
        key={userProfile?.id || 'no-profile'}
        initialUserProfile={userProfile} 
        onProfileUpdate={handleProfileUpdateAndRefresh}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/member')}
                  className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Go back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {shopList.name}
                </h1>
                {isOwner && (
                  <button
                    onClick={handleShareShopList}
                    className="ml-4 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 
                             text-white font-medium rounded-md 
                             transition-colors duration-200"
                  >
                    Share
                  </button>
                )}
                <button
                  onClick={handleViewMembers}
                  className="ml-2 px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 
                           text-white font-medium rounded-md 
                           transition-colors duration-200"
                  disabled={isLoadingMembers}
                >
                  {isLoadingMembers ? 'Loading...' : 'View Members'}
                </button>
              </div>
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 
                         text-white font-medium rounded-md 
                         transition-colors duration-200"
              >
                Leave
              </button>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Items</h2>
                <button
                  onClick={handleAddItem}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 
                           text-white font-medium rounded-md 
                           transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {shopList.items && shopList.items.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                    {shopList.items.map((item) => (
                      <li key={item.id} className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-grow">
                            <button
                              onClick={() => toggleItemExpansion(item.id)}
                              className="flex-grow text-left"
                            >
                              <div className="flex items-center">
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</span>
                                  {item.brand_name && (
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({item.brand_name})</span>
                                  )}
                                  {item.extra_info && (
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">- {item.extra_info}</span>
                                  )}
                                </div>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className={`h-5 w-5 ml-2 text-gray-400 transform transition-transform duration-200 ${expandedItems.has(item.id) ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.flyer_details && item.flyer_details.length > 0 && (
                              <div className="mr-8 min-w-[200px]">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Hot deals at:</span>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {[...new Set(item.flyer_details.map(flyer => flyer.store))].map((store, index) => (
                                    <span 
                                      key={index}
                                      className="inline-block px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                                    >
                                      {store}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={item.is_bought}
                                onChange={(e) => handleEditItem(item.id, { is_bought: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                aria-label={`Mark ${item.item_name} as ${item.is_bought ? 'pending' : 'bought'}`}
                              />
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditItem(item.id);
                              }}
                              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              aria-label="Edit item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveItem(item.id);
                              }}
                              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              aria-label="Remove item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {expandedItems.has(item.id) && item.flyer_details && item.flyer_details.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <div className="flex overflow-x-auto gap-3 pb-2">
                              {item.flyer_details.map((flyer, index) => (
                                <div key={index} className="flex-none w-64 bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {flyer.store}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      {flyer.brand} - {flyer.product_name}
                                    </div>
                                    {flyer.description && (
                                      <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {flyer.description}
                                      </div>
                                    )}
                                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                      {flyer.price_text}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      {new Date(flyer.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} - {new Date(flyer.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No items added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveShopList}
        title="Leave Shop List"
        message="Are you sure you want to leave this shop list? You will need a new share code to rejoin."
        confirmText="Leave"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onConfirm={() => {}}
        title="Share Shop List"
        message={
          <>
            <p>Share this code with others to let them join your shop list:</p>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
              <code className="text-lg font-mono">{shareCode}</code>
            </div>
          </>
        }
        confirmText="Close"
        cancelText=""
      />

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleConfirmRemoveItem}
        title="Remove Item"
        message="Are you sure you want to remove this item from the shop list?"
        confirmText="Remove"
        cancelText="Cancel"
      />

      <EditItemDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveEditedItem}
        item={itemToEdit}
      />

      <ConfirmDialog
        isOpen={showMembersDialog}
        onClose={() => setShowMembersDialog(false)}
        onConfirm={() => setShowMembersDialog(false)}
        title="Shop List Members"
        message={
          <>
            {membersError ? (
              <p className="text-sm text-red-500 dark:text-red-400">{membersError}</p>
            ) : (
              <div className="space-y-2">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{member.nickname}</span>
                      {member.id === shopList.owner.id && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          Owner
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No members yet</p>
                )}
              </div>
            )}
          </>
        }
        confirmText="Close"
        cancelText=""
      />
    </div>
  );
}
