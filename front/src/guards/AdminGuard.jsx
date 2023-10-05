import PropTypes from "prop-types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

function AdminGuard({ children }) {
  const { user, isLoading } = useAuth(); // Destructurer isLoading depuis le contexte d'authentification
  const navigate = useNavigate();

  // Définir la fonction isAdmin à l'intérieur du composant AdminGuard
  const isAdmin = () => {
    return user && user.role === "ROLE_ADMIN"; // Ajustez la chaîne de rôle pour correspondre à votre système
  };

  useEffect(() => {
    if (!isLoading && !isAdmin()) {
      // Vérifier que le chargement est terminé avant de rediriger
      navigate("/");
    }
  }, [navigate, isLoading, user]); // Ajouter isLoading et user à l'array des dépendances

  // N'afficher rien si les données sont en cours de chargement ou si l'utilisateur n'est pas un administrateur
  if (isLoading || !isAdmin()) {
    return null;
  }

  return children;
}

AdminGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminGuard;
