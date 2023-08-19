//import { useNavigate, } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import API from "../api"


const isAuthenticated = () => {
  const authToken = localStorage.getItem("token")
  return !!authToken;
};

function AuthGuard({ children }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);

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
        navigate("/login")
      });
    }
  }, [navigate]);

  if (!isAuthenticated || isAdmin === false) {
    return null;
  }

  return isAdmin !== null ? children : null;
}

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired
}

export default AuthGuard;