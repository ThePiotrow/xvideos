import PropTypes from "prop-types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

function AdminGuard({ children }) {
  const { user } = useAuth(); // Destructure user from the auth context
  const navigate = useNavigate();

  // Définissez la fonction isAdmin à l'intérieur du composant AdminGuard
  const isAdmin = () => {
    return user && user.role === "ROLE_ADMIN"; // Adjust the role string to match your system
  };

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
    }
  }, [navigate, isAdmin]); // Add isAdmin to the dependency array

  if (!isAdmin()) {
    return null;
  }

  return children;
}

AdminGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminGuard;
