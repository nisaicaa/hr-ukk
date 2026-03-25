import { useEffect } from 'react';
import { isAuthenticated, getUser, checkRole, redirectToLogin, bootstrapAuthFromQuery } from '../../../../services/helper/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  useEffect(() => {
    bootstrapAuthFromQuery();
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    const user = getUser();
    if (!user || !checkRole('FINANCE')) {
      redirectToLogin();
    }
  }, []);

  if (!isAuthenticated() || !checkRole('FINANCE')) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
