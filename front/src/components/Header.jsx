import { useState, useEffect } from "react";
//import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import useToken from "../hooks/useToken";
import { useAuth } from "../contexts/authContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, setUser, token } = useAuth();
  const hasToken = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  const handleLogout = () => {
    API.put("/users/logout", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      })
      .catch((error) => console.error(error));
  };

  return (
    <header className="w-full">
      <nav
        x-data="{ isOpen: false }"
        className="relative bg-white dark:bg-gray-800 transparent"
      >
        <div className="container py-4 mx-auto">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex items-center justify-between lg:hidden">
              <div className="flex lg:hidden">
                <button
                  x-cloak="true"
                  onClick={() => setIsOpen(!isOpen)}
                  type="button"
                  className="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400"
                  aria-label="toggle menu"
                >
                  <svg
                    x-show="!isOpen"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 8h16M4 16h16"
                    />
                  </svg>

                  <svg
                    x-show="isOpen"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              x-cloak="true"
              className={
                [isOpen
                  ? "translate-x-0 opacity-100"
                  : "opacity-0 -translate-x-full", "flex-grow absolute inset-x-0 z-20 w-full py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center"]
              }
            >
              <div className="flex flex-col -mx-6 lg:flex-row lg:items-center lg:mx-8">
                <Link
                  to="/"
                  className="px-3 py-2 mx-3 mt-2 text-gray-700 transition-colors duration-300 transform rounded-md lg:mt-0 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Accueil
                </Link>
                <Link
                  to="/live"
                  className="px-3 py-2 mx-3 mt-2 text-gray-700 transition-colors duration-300 transform rounded-md lg:mt-0 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Live
                </Link>

                <div className="relative mt-4 lg:mt-0 lg:mx-4">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="w-4 h-4 text-gray-600 dark:text-gray-300"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </span>

                  <input
                    type="text"
                    className="w-full py-1 pl-10 pr-4 text-gray-700 placeholder-gray-600 bg-white border-b border-gray-600 dark:placeholder-gray-300 dark:focus:border-gray-300 lg:w-56 lg:border-transparent dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:border-gray-600"
                    placeholder="Search"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-6 lg:flex lg:mt-0 lg:-mx-2">
                {user ? (
                  <div className="flex items-center mt-4 lg:mt-0 relative">
                    <Link
                      onClick={handleLogout}
                      className="px-3 py-2 mx-3 mt-2 text-gray-700 transition-colors duration-300 transform rounded-md lg:mt-0 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Se déconnecter
                    </Link>
                    <div
                      onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                      className="w-8 h-8 overflow-hidden border-2 border-gray-400 rounded-full flex items-center justify-center bg-gray-200"
                    >
                      <span className="text-xl font-bold text-gray-600">
                        {user.username ? user.username[0].toUpperCase() : ""}
                      </span>
                    </div>
                    {isOpenDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white border rounded shadow dark:text-gray-200">
                        <Link
                          onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                          to="/medias"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Médias
                        </Link>
                        <Link
                          onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                          to="/profile"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Profil
                        </Link>
                        <Link
                          onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                          to="/lives/launch"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Lancer un live
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-3 py-2 mx-3 mt-2 text-gray-700 transition-colors duration-300 transform rounded-md lg:mt-0 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Se connecter
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
