import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const isAuthenticated = () => {
  const authToken = localStorage.getItem('token');
  return !!authToken;
};

function AuthGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  return children;
}

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthGuard;
