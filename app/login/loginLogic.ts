import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { API_CONFIG, getCallbackUrl, getAuthUrl } from '../api/apiConfig';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Check if we have a valid access token
      const accessToken = localStorage.getItem('access_token');
      console.log("accessToken", accessToken)

      if (!accessToken) {
        // Generate random state for CSRF protection
        const state = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        
        // Store state in session storage to verify later
        sessionStorage.setItem('oauth_state', state);

        // Construct OAuth authorization URL
        const authUrl = new URL(getAuthUrl(API_CONFIG.ENDPOINTS.AUTHORIZE));
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', API_CONFIG.CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', getCallbackUrl());
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('scope', 'profile shoplist search');
        if (error) {
          authUrl.searchParams.append('error', error);
        }

        // Redirect to authorization endpoint
        window.location.href = authUrl.toString();
        return;
      } else {
        // TODO: Implement token verification and redirection logic
        navigate(`/member`);
        return;
      }
    };

    checkAuthAndRedirect();
  }, []);

  return { error };
} 