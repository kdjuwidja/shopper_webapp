import { useCallback } from './callbackLogic';

export default function CallbackPage() {
  const { error } = useCallback();

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