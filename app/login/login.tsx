import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // If there's an error, display it and don't redirect
      if (error) {
        return; // Don't redirect if there's an error
      }

      // Check if we have a valid access token
      const accessToken = sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        // Generate random state for CSRF protection
        const state = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        
        // Store state in session storage to verify later
        sessionStorage.setItem('oauth_state', state);

        // Construct OAuth authorization URL
        const authUrl = new URL(import.meta.env.VITE_AUTH_URL);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', import.meta.env.VITE_CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', `${window.location.origin}/callback`);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('scope', 'profile');

        // Redirect to authorization endpoint
        window.location.href = authUrl.toString();
        return;
      } else {
        // TODO: Implement token verification and redirection logic
        navigate('/member');
        return;
      }
    };

    checkAuthAndRedirect();
  }, [navigate, error]);

  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error === 'invalid_state' && 'Invalid state - possible security issue. Please try again.'}
            {error === 'token_exchange_failed' && 'Failed to complete authentication. Please try again.'}
            {error === 'invalid_response' && 'Invalid response from authentication server. Please try again.'}
            {!['invalid_state', 'token_exchange_failed', 'invalid_response'].includes(error) && error}
          </div>
        ) : (
          <h2 style={{
            fontSize: '1.25rem',
            color: '#666',
            fontWeight: 'normal'
          }}>
            Redirecting to login...
          </h2>
        )}
      </div>
    </div>
  );
} 