import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  // Get the basename from environment variable
  const basename = import.meta.env.VITE_BASE_PATH || '';

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

        const basename = import.meta.env.VITE_BASE_PATH || '';
        // Construct OAuth authorization URL
        const authUrl = new URL(import.meta.env.VITE_AUTH_URL);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', import.meta.env.VITE_CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', `${window.location.origin}${basename}/callback`);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('scope', 'profile');
        if (error) {
          authUrl.searchParams.append('error', error);
        }

        // Redirect to authorization endpoint
        window.location.href = authUrl.toString();
        return;
      } else {
        // TODO: Implement token verification and redirection logic
        navigate(`${basename ? `/${basename}` : ''}/member`);
        return;
      }
    };

    checkAuthAndRedirect();
  }, [basename]);

  return { error };
} 