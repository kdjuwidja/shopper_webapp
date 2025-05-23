import { TopBar } from './components/topBar';
import { useEditShopList } from './editShopListLogic';
import type { UserProfile } from '../common/model/userprofile';
import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from './components/confirmDialog';
import { EditItemDialog } from './components/editItemDialog';

// Add ThumbnailPopup component
const ThumbnailPopup = ({ isOpen, onClose, imageUrl, altText }: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageUrl: string; 
  altText: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt={altText}
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [shareError, setShareError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{
    id: number;
    item_name: string;
    brand_name: string;
    extra_info: string;
    thumbnail: string;
  } | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<{ url: string; alt: string } | null>(null);

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
          extra_info: item.extra_info || '',
          thumbnail: item.thumbnail || ''
        });
        setShowEditDialog(true);
      }
    }
  };

  // Handle saving edited item
  const handleSaveEditedItem = (updatedData: { item_name: string; brand_name: string; extra_info: string }) => {
    if (itemToEdit) {
      // Preserve the existing thumbnail when updating other fields
      editItem(itemToEdit.id, {
        ...updatedData,
        thumbnail: itemToEdit.thumbnail
      });
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
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Members:</span>
              {shopList.members && shopList.members.length > 0 ? (
                shopList.members.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <span className="text-sm text-gray-900 dark:text-white">{member.nickname}</span>
                    {member.id === shopList.owner.id && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">No members yet</span>
              )}
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
                          <div className="flex items-center">
                            {item.thumbnail && (
                              <img 
                                src={item.thumbnail} 
                                alt={`${item.item_name} thumbnail`} 
                                className="w-[50px] h-[50px] object-cover rounded mr-3 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedThumbnail({ url: item.thumbnail, alt: item.item_name })}
                              />
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</span>
                              {item.brand_name && (
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({item.brand_name})</span>
                              )}
                              {item.extra_info && (
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">- {item.extra_info}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
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

      {/* Add ThumbnailPopup component */}
      <ThumbnailPopup
        isOpen={!!selectedThumbnail}
        onClose={() => setSelectedThumbnail(null)}
        imageUrl={selectedThumbnail?.url || ''}
        altText={selectedThumbnail?.alt || ''}
      />
    </div>
  );
}
