import { useLogin } from './loginLogic';

export default function LoginPage() {
  const { error } = useLogin();

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