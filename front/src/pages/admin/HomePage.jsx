import React, { useState, useEffect } from "react";
import API from "../../api";
import Users from "./users/Users";
import Medias from "./users/Medias";
// ... autres imports

function HomePage() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // Définir l'onglet actif initial

  useEffect(() => {
    // ... votre code useEffect existant
  }, []);

  return (
    <div>
      <div className="tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Utilisateurs
        </button>
        <button
          className={activeTab === "media" ? "active" : ""}
          onClick={() => setActiveTab("media")}
        >
          Médias
        </button>
        <button
          className={activeTab === "lives" ? "active" : ""}
          onClick={() => setActiveTab("lives")}
        >
          Lives
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "users" && (
          <div className="users-tab">
            <Users />
          </div>
        )}
        {activeTab === "media" && (
          <div className="media-tab">
            <Medias />
          </div>
        )}
        {activeTab === "lives" && (
          <div className="lives-tab">{/* Contenu de l'onglet Lives */}</div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
