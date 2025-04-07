import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export function useCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get authorization code and state from URL parameters
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log("code", code)
    console.log("state", state)
    console.log("error", error)

    if (error) {
      setError(error);
      return;
    }

    if (!code || !state) {
      setError('Invalid response - missing required parameters');
      return;
    }

    // Verify state matches what we sent
    const storedState = sessionStorage.getItem('oauth_state');
    if (!storedState || storedState !== state) {
      setError('Invalid state - possible security issue');
      return;
    }

    // Exchange authorization code for tokens
    const exchangeCodeForTokens = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            state,
            redirect_uri: window.location.origin + '/callback',
            grant_type: 'authorization_code',
            client_id: import.meta.env.VITE_CLIENT_ID,
            client_secret: import.meta.env.VITE_CLIENT_SECRET
          }).toString()
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for tokens');
        }

        const tokens = await response.json();

        console.log("tokens", tokens)
        
        if (!tokens.access_token) {
          throw new Error('No access token received');
        }

        // Store tokens securely
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);

        // Clear the state from session storage after successful exchange
        sessionStorage.removeItem('oauth_state');

        // Verify token is stored before navigation
        const storedToken = localStorage.getItem('access_token');
        if (storedToken === tokens.access_token) {
          console.log("login successful")
          setError(null); // Clear error to indicate success
          return true;
        } else {
          throw new Error('Token storage verification failed');
        }
      } catch (error) {
        console.error('Token exchange error:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setError('Failed to complete authentication');
        return false;
      }
    };

    exchangeCodeForTokens();
  }, []); // Empty dependency array - run once on mount

  useEffect(() => {
    if (error) {
      console.log("redirecting to login with error:", error);
      navigate(`/login?error=${encodeURIComponent("User name or password is incorrect.")}`);
    } else {
      navigate('/member');
    }
  }, [error]);

  return { error };
} 