import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URI}:${
    import.meta.env.VITE_API_GATEWAY_PORT
  }`, // l'URL de base de vos requêtes API
  timeout: 10000, // spécifie le nombre de millisecondes avant que la requête n'expire
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent: {
    rejectUnauthorized: false,
  },
});

API.interceptors.request.use(
  function (config) {
    // Insérer le token d'authentification dans l'en-tête de chaque requête
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Gérer les erreurs
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  function (response) {
    // Faire quelque chose avec les données de réponse
    return response.data;
  },
  function (error) {
    // Faire quelque chose avec les erreurs de requête
    if (error.response) {
      if (error.response.status === 401) {
        toast.error(
          "Erreur d'authentification. Veuillez vous connecter à nouveau."
        );
        // Vous pourriez vouloir faire une redirection vers la page de connexion ici
      }
    } else if (error.request) {
      toast.error("No response was received", error.request);
    } else {
      // Quelque chose s'est mal passé lors de la configuration de la requête
      toast.error("Error", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
