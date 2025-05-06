import type { UserProfile } from '../../common/model/userprofile';
import { InitializeUserProfile } from './initializeUserProfile';
import { useTopBar } from './topBarLogic';

interface TopBarProps {
  initialUserProfile: UserProfile | null;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

export function TopBar({ initialUserProfile, onProfileUpdate }: TopBarProps) {
  const {
    userProfile,
    showPostalCodeModal,
    handleUpdate,
    handleSubmit,
    setShowPostalCodeModal,
  } = useTopBar(initialUserProfile, onProfileUpdate);

  if (!userProfile) return null;

  return (
    <>
      {showPostalCodeModal && (
        <InitializeUserProfile
          onSubmit={handleSubmit}
          onCancel={() => setShowPostalCodeModal(false)}
          userProfile={userProfile}
        />
      )}
      <div className="w-full bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome, {userProfile.nickname}!
            </h1>
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
    </>
  );
} 