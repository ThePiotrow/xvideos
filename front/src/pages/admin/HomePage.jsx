import React, { useState, useEffect, useMemo } from "react";
import API from "../../api";
import Users from "./users/Users";
import Medias from "./users/Medias";
import Lives from "./users/Lives";
import { useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}
function HomePage() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const query = useQuery();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash.slice(1)) {
      setActiveTab(hash.slice(1));
    }
  }, [hash]);

  return (
    <div className="container px-6 py-10 mx-auto">
      <div className="flex items-center justify-center">
        <div className="flex items-center p-1 border border-slate-950 dark:border-gray-700 rounded-xl">
          <a
            className={`bg-slate-800 px-4 py-2 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-slate-700 hover:text-white rounded-xl md:px-12 ${
              activeTab === "users" ? "active" : ""
            }`}
            href="#users"
          >
            Utilisateurs
          </a>
          <a
            className={`bg-slate-800 px-4 py-2 mx-4 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-blue-600 hover:text-white rounded-xl md:mx-8 md:px-12 ${
              activeTab === "media" ? "active" : ""
            }`}
            href="#medias"
          >
            Médias
          </a>
          <a
            className={`bg-slate-800 px-4 py-2 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-blue-600 hover:text-white rounded-xl md:px-12 ${
              activeTab === "lives" ? "active" : ""
            }`}
            href="#lives"
          >
            Lives
          </a>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "users" && (
          <div className="users-tab">
            <Users />
          </div>
        )}
        {activeTab === "medias" && (
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
