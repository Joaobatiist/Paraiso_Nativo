import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import './PrivateRouter.css';

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="private-route-loading">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};