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
    leaveShopList,
    requestShareCode
  } = useEditShopList(id ? parseInt(id) : null);

  // State for confirm dialog
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

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
      window.location.href = '/member/home';
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
                  onClick={() => window.history.back()}
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
    </div>
  );
}
