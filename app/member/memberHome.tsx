import { InitializeUserProfile } from './components/initializeUserProfile';
import { useMemberHome } from './memberHomeLogic';

export interface UserProfile {
  id: string;
  nickname: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

export default function MemberHome() {
  const {
    userProfile,
    showPostalCodeModal,
    loading,
    handleUpdate,
    createOrUpdateUserProfile,
    setShowPostalCodeModal
  } = useMemberHome();

  return (
    <div className="min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <h1>Loading...</h1>
        </div>
      ) : (
        <>
          {showPostalCodeModal && <InitializeUserProfile 
            onSubmit={createOrUpdateUserProfile} 
            onCancel={() => setShowPostalCodeModal(false)}
            userProfile={userProfile} 
          />}
          {userProfile && (
            <div className="w-full bg-white dark:bg-gray-800 shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome, {userProfile.nickname}!</h1>
                  <div className="flex items-center space-x-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      Postal Code: <span className="font-medium">{userProfile.postal_code}</span>
                    </p>
                    <button
                      onClick={handleUpdate}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 
                               text-white font-medium rounded-md 
                               transition-colors duration-200"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
