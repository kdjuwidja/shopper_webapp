import { TopBar } from './components/topBar';
import { useEditShopList } from './editShopListLogic';
import type { UserProfile } from '../common/model/userprofile';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from './components/confirmDialog';

export default function EditShopList() {
  // Get the shop list ID from the URL parameters
  const { id } = useParams<{ id: string }>();
  
  const { 
    userProfile, 
    shopList, 
    loading, 
    error,
    handleProfileUpdate,
    refreshShopList,
    leaveShopList
  } = useEditShopList(id ? parseInt(id) : null);

  // State for confirm dialog
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
    try {
      await leaveShopList();
      setShowLeaveConfirm(false);
      // Navigate back to member home after leaving
      window.location.href = '/member';
    } catch (error) {
      console.error('Failed to leave shop list:', error);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {shopList.name}
              </h1>
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
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Items</h2>
                <div className="space-y-2">
                  {shopList.items && shopList.items.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {shopList.items.map((item) => (
                        <li key={item.id} className="py-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</span>
                              {item.brand_name && (
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({item.brand_name})</span>
                              )}
                            </div>
                            <div className="flex items-center">
                              {item.extra_info && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{item.extra_info}</span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${item.is_bought ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                {item.is_bought ? 'Bought' : 'Pending'}
                              </span>
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
              
              <div className="col-span-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Members</h2>
                <div className="space-y-2">
                  {shopList.members && shopList.members.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {shopList.members.map((member) => (
                        <li key={member.id} className="py-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-900 dark:text-white">{member.nickname}</span>
                            {member.id === shopList.owner.id && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                Owner
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No members yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLeaveConfirm && (
        <ConfirmDialog
          isOpen={showLeaveConfirm}
          title="Leave Shop List"
          message="Are you sure you want to leave this shop list?"
          confirmLabel="Leave"
          cancelLabel="Cancel"
          onConfirm={handleLeaveShopList}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
    </div>
  );
}
