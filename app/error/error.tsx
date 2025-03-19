import { useRouteError, useLocation } from 'react-router';

export default function ErrorPage() {
  const routeError = useRouteError();
  const location = useLocation();
  const state = location.state as { message?: string } | null;

  const errorMessage = state?.message || (routeError instanceof Error ? routeError.message : 'Unknown error occurred');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1f2937'
      }}>
        Oops!
      </h1>
      <p style={{
        fontSize: '1.125rem',
        color: '#4b5563',
        marginBottom: '1rem'
      }}>
        Sorry, an unexpected error has occurred.
      </p>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        fontStyle: 'italic'
      }}>
        {errorMessage}
      </p>
    </div>
  );
}
