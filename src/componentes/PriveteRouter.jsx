import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading){ return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
        <p style={{ color: 'var(--gray-500)', fontSize: '18px' }}>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};