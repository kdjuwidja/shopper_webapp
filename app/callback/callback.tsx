import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

export default function CallbackPage() {
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
        sessionStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
          sessionStorage.setItem('refresh_token', tokens.refresh_token);
        }

        // Clear the state from session storage after successful exchange
        sessionStorage.removeItem('oauth_state');

        // Verify token is stored before navigation
        const storedToken = sessionStorage.getItem('access_token');
        if (storedToken === tokens.access_token) {
          console.log("login successful")
          setError(null); // Clear error to indicate success
          return true;
        } else {
          throw new Error('Token storage verification failed');
        }
      } catch (error) {
        console.error('Token exchange error:', error);
        setError('Failed to complete authentication');
        return false;
      }
    };

    exchangeCodeForTokens();
  }, []); // Empty dependency array - run once on mount

  useEffect(() => {
    if (error) {
      navigate('/error', { state: { message: error } });
    } else {
      setTimeout(() => {
        navigate('/member');
      }, 2000);
    }
  }, [error, navigate]);

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>Processing login...</h2>
          <div style={{
            width: '2rem',
            height: '2rem',
            margin: '0 auto',
            border: '2px solid #e5e7eb',
            borderTopColor: '#1f2937',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    </>
  );
}