import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const getAuthenticationStatus = () => {
  const authToken = localStorage.getItem("token");
  return !!authToken;
};

function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    getAuthenticationStatus
  );
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(getAuthenticationStatus());
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
}

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthGuard;
