import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Ajout de l'état de chargement

  useEffect(() => {
    if (!token) {
      setIsLoading(false); // Si aucun token n'est présent, définir isLoading sur false
      return;
    }
    API.get("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch((error) => {
        handleRemoveToken();
      })
      .finally(() => {
        setIsLoading(false); // Une fois la requête terminée, définir isLoading sur false
      });
  }, [token]);

  const handleRemoveToken = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
