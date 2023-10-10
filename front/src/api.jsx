import axios from "axios";
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URI}:${import.meta.env.VITE_API_GATEWAY_PORT
    }`, // l'URL de base de vos requêtes API
  timeout: 10000, // spécifie le nombre de millisecondes avant que la requête n'expire
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent: agent,
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
        console.log(
          "Erreur d'authentification. Veuillez vous connecter à nouveau."
        );
        // Vous pourriez vouloir faire une redirection vers la page de connexion ici
      }
    } else if (error.request) {
      console.log("No response was received", error.request);
    } else {
      // Quelque chose s'est mal passé lors de la configuration de la requête
      console.log("Error", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
