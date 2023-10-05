import React, { useState, useEffect } from "react";
import API from "../../api";
import Users from "./users/Users";
import Medias from "./users/Medias";
import Lives from "./users/Lives";
// ... autres imports

function HomePage() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // Définir l'onglet actif initial

  return (
    <div className="container px-6 py-10 mx-auto">
      <div className="flex items-center justify-center">
        <div className="flex items-center p-1 border border-slate-950 dark:border-gray-700 rounded-xl">
          <button
            className={`bg-slate-800 px-4 py-2 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-slate-700 hover:text-white rounded-xl md:px-12 ${
              activeTab === "users" ? "active" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            Utilisateurs
          </button>
          <button
            className={`bg-slate-800 px-4 py-2 mx-4 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-blue-600 hover:text-white rounded-xl md:mx-8 md:px-12 ${
              activeTab === "media" ? "active" : ""
            }`}
            onClick={() => setActiveTab("media")}
          >
            Médias
          </button>
          <button
            className={`bg-slate-800 px-4 py-2 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-blue-600 hover:text-white rounded-xl md:px-12 ${
              activeTab === "lives" ? "active" : ""
            }`}
            onClick={() => setActiveTab("lives")}
          >
            Lives
          </button>
        </div>
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
          <div className="lives-tab">
            <Lives />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
