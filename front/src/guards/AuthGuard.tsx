import { useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import API from "../api"

const isAuthenticated = (): boolean => {
  const authToken = localStorage.getItem("token");
  return !!authToken;
};

interface AuthGuardProps {
  children: ReactNode;
}

function AuthGuard({ children }: AuthGuardProps): ReactNode | null {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => {
        if (response.isAdmin) {
          setIsAdmin(true);
        } else {
          navigate("/login");
        }
      }).catch((error) => {
        console.error(error);
        navigate("/login");
      });
    }
  }, [navigate]);

  if (!isAuthenticated() || isAdmin === false) {
    return null;
  }

  return isAdmin !== null ? children : null;
}

export default AuthGuard;
