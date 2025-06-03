import { CreateShopList } from './components/createShopList';
import { ConfirmDialog } from './components/confirmDialog';
import { TopBar } from './components/topBar';
import { useMemberHome } from './memberHomeLogic';
import { useState } from 'react';
import { InitializeUserProfile } from './components/initializeUserProfile';
import type { UserProfile } from '../common/model/userprofile';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { ROUTES } from '../config/routes';

export interface ShopListItem {
  id: number;
  name: string;
  brand_name: string;
  extra_info: string;
  is_bought: boolean;
  available_stores: string[];
}

export interface ShopList {
  id: number;
  name: string;
  owner: {
    id: string;
    nickname: string;
  };
  items: ShopListItem[];
}

export default function MemberHome() {
  const {
    userProfile,
    shopLists,
    loading,
    createShopList,
    leaveShopList,
    fetchShopLists,
    joinShopList,
    updateUserProfile
  } = useMemberHome();

  const [showCreateShopList, setShowCreateShopList] = useState(false);
  const [shopListToLeave, setShopListToLeave] = useState<number | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCreateShopList = async (data: { name: string }) => {
    try {
      await createShopList(data.name);
      setShowCreateShopList(false);
    } catch (error) {
      console.error('Failed to create shop list:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleLeaveShopList = async (id: number) => {
    try {
      await leaveShopList(id);
      setShopListToLeave(null);
    } catch (error) {
      console.error('Failed to leave shop list:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleJoinShopList = async () => {
    if (!shareCode.trim()) {
      setJoinError('Please enter a share code');
      return;
    }
    
    try {
      setJoinError(null);
      await joinShopList(shareCode);
      await fetchShopLists();
      setShowJoinDialog(false);
      setShareCode('');
    } catch (error) {
      console.error('Failed to join shop list:', error);
      setJoinError('Invalid share code or unable to join the shop list');
    }
  };

  const handleProfileUpdate = () => {
    // Refresh shop lists when profile is updated
    fetchShopLists();
  };

  const handleShopListClick = (id: string) => {
    const basename = import.meta.env.VITE_BASE_PATH || '';
    window.location.href = `${basename}${ROUTES.SHOPLIST(id)}`;
  };

  const handleProfileCreate = async (nickname: string, postalCode: string) => {
    try {
      await updateUserProfile(nickname, postalCode);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <h1>Loading...</h1>
        </div>
      ) : (
        <>
          {showCreateShopList && (
            <CreateShopList
              onSubmit={handleCreateShopList}
              onCancel={() => setShowCreateShopList(false)}
            />
          )}
          <ConfirmDialog
            isOpen={shopListToLeave !== null}
            title="Leave Shop List"
            message="Are you sure you want to leave this shop list? You can always rejoin later."
            confirmText="Leave"
            cancelText="Cancel"
            onConfirm={() => shopListToLeave !== null && handleLeaveShopList(shopListToLeave)}
            onClose={() => setShopListToLeave(null)}
          />
          <ConfirmDialog
            isOpen={showJoinDialog}
            title="Join Shop List"
            message={
              <div className="space-y-4">
                <p>Enter the share code to join a shop list:</p>
                <div>
                  <input
                    type="text"
                    value={shareCode}
                    onChange={(e) => setShareCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter share code"
                  />
                  {joinError && (
                    <p className="mt-2 text-sm text-red-600">{joinError}</p>
                  )}
                </div>
              </div>
            }
            confirmText="Join"
            cancelText="Cancel"
            onConfirm={handleJoinShopList}
            onClose={() => {
              setShowJoinDialog(false);
              setShareCode('');
              setJoinError(null);
            }}
          />
          {!userProfile ? (
            <InitializeUserProfile
              onSubmit={handleProfileCreate}
              onCancel={() => {}}
            />
          ) : (
            <>
              <TopBar 
                initialUserProfile={userProfile} 
                onProfileUpdate={handleProfileUpdate}
              />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center px-[5%] mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Shop lists</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowJoinDialog(true)}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 
                               text-white font-medium rounded-md 
                               transition-colors duration-200"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => setShowCreateShopList(true)}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 
                               text-white font-medium rounded-md 
                               transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="px-[5%]">
                  {shopLists.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No shop lists yet. Create one to get started!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {shopLists.map((list) => (
                        <div
                          key={list.id}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer"
                          onClick={() => handleShopListClick(list.id.toString())}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{list.name}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShopListToLeave(list.id);
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 
                                       transition-colors duration-200 text-sm font-medium"
                              title="Leave shop list"
                            >
                              Leave
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Owner: <span className="font-medium text-gray-700 dark:text-gray-300">{list.owner.nickname}</span>
                          </p>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hot deals at:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {[...new Set(list.items.flatMap(item => item.available_stores || []))].map((store, index) => (
                                <span 
                                  key={index}
                                  className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                                >
                                  {store}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
