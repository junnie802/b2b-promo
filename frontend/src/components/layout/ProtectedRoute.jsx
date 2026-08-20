import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { resolveRedirect } from './authGuard';
import Header from './Header';

function ProtectedRoute({ roles }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const redirectTo = resolveRedirect({ accessToken, user, roles });

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
