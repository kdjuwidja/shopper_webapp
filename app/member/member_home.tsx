import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { InitializeUserProfile } from './components/InitializeUserProfile';

export interface UserProfile {
  id: string;
  nickname: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

export default function MemberHome() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPostalCodeModal, setShowPostalCodeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleUpdate = () => {
    setShowPostalCodeModal(true);
  };

  const createOrUpdateUserProfile = async (nickname: string, postalCode: string) => {
    try {
      // Don't submit if neither the postal code nor nickname has changed
      if (userProfile && 
          userProfile.postal_code === postalCode && 
          userProfile.nickname === nickname) {
        setShowPostalCodeModal(false);
        return;
      }

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          nickname: nickname,
          postal_code: postalCode 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create or update user profile');
      }
     
      // Only update the userProfile state after confirming the API call was successful
      setUserProfile(prev => ({
        ...prev!,
        nickname: nickname,
        postal_code: postalCode
      }));
      setShowPostalCodeModal(false);
    } catch (error) {
      console.error('Error creating or updating user profile:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/v1/user`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setShowPostalCodeModal(true);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
