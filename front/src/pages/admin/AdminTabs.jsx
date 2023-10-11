import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AdminTabs() {
    const [activeTab, setActiveTab] = useState("users");
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        navigate(`/admin/${tab}`);
    };

    useEffect(() => {
        const path = pathname.split("/").pop();
        if (["users", "medias", "lives"].includes(path)) {
            setActiveTab(path);
        }
    }, [pathname]);

    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center p-1 border border-slate-950 dark:border-slate-700 rounded-xl">
                <a
                    className={`bg-slate-800 px-4 py-2 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-slate-700 hover:text-white rounded-xl md:px-12 ${activeTab === "users" ? "active" : ""}`}
                    href="users"
                >
                    Utilisateurs
                </a>
                <a
                    className={`bg-slate-800 px-4 py-2 mx-4 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-blue-600 hover:text-white rounded-xl md:mx-8 md:px-12 ${activeTab === "medias" ? "active" : ""}`}
                    href="medias"
                >
                    Médias
                </a>
                <a
                    className={`bg-slate-800 px-4 py-2 text-sm font-medium text-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-blue-400 dark:hover:text-white focus:outline-none hover:bg-blue-600 hover:text-white rounded-xl md:px-12 ${activeTab === "lives" ? "active" : ""}`}
                    href="lives"
                >
                    Lives
                </a>
            </div>
        </div>
    );
}

export default AdminTabs;
