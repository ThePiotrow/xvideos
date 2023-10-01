import { useState, useEffect } from "react";
//import logo from "../assets/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import useToken from "../hooks/useToken";
import { useAuth } from "../contexts/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFaceSmile,
  faFilm,
  faPowerOff,
  faVideo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function Header({
  isOpen,
  setIsOpen,
  isOpenDropdown,
  setIsOpenDropdown,
}) {
  const navigate = useNavigate();
  const { user, setUser, token, setToken } = useAuth();

  const location = useLocation();

  const handleLogout = () => {
    API.put("/users/logout", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setToken(null);
        setUser(null);
        navigate("/login");
      })
      .catch((error) => console.error(error));
  };

  //On navigate, set isOpen and isOpenDropdown to false
  useEffect(() => {
    setIsOpen(false);
    setIsOpenDropdown(false);
  }, [location]);

  return (
    <header className="w-full z-[100] pt-3">
      <nav x-data="{ isOpen: false }" className="relative transparent">
        <div className="py-4">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex items-center justify-between lg:hidden">
              <div className="flex lg:hidden">
                <button
                  x-cloak="true"
                  onClick={() => setIsOpen(!isOpen)}
                  type="button"
                  className="text-slate-500 dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-400 focus:outline-none focus:text-slate-600 dark:focus:text-slate-400"
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
              className={`${
                isOpen
                  ? "translate-y-0 opacity-100"
                  : "opacity-0 -translate-y-full"
              }  absolute overflow-y-auto lg:overflow-visible justify-between flex-grow h-screen lg:h-fit top-0 left-0 right-0 inset-x-0 z-20 w-full py-4 transition-all duration-300 ease-in-out bg-slate-900 lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:w-auto lg:opacity-100 lg:translate-y-0 lg:flex lg:items-center`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="lg:hidden self-start"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-2xl" />
                </button>
                <Link
                  onClick={() => {
                    setIsOpenDropdown(false);
                    setIsOpen(false);
                  }}
                  to="/"
                  className={`px-4 py-4 lg:py-2 text-slate-100 transition-colors duration-300 transform rounded-md lg:mt-0 [&:not(.active)]:hover:bg-slate-700 [&:not(.active)]:hover:text-slate-100  ${
                    location.pathname === "/"
                      ? "bg-slate-50 text-slate-900 hover:text-slate-900 active"
                      : "bg-slate-800"
                  }`}
                >
                  Vidéos
                </Link>
                <Link
                  onClick={() => {
                    setIsOpenDropdown(false);
                    setIsOpen(false);
                  }}
                  to="/live"
                  className={`px-4 py-4 lg:py-2 text-slate-100 transition-colors duration-300 transform rounded-md lg:mt-0 [&:not(.active)]:hover:bg-slate-700 [&:not(.active)]:hover:text-slate-100  ${
                    location.pathname === "/live"
                      ? "bg-slate-50 text-slate-900 hover:text-slate-900 active"
                      : "bg-slate-800"
                  }`}
                >
                  Lives
                </Link>

                <div className="relative mt-4 lg:mt-0 lg:mx-4">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="w-4 h-4 text-slate-600"
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
                    className="w-full py-1 pl-10 pr-4 text-slate-200 placeholder-slate-200 border-b border-slate-200 bg-transparent lg:w-56 lg:border-transparent focus:outline-none focus:border-slate-200"
                    placeholder="Search"
                  />
                </div>
              </div>

              <div
                className={`flex lg:justify-center mt-10 lg:flex lg:mt-0 
              ${isOpen ? "justify-end" : ""}`}
              >
                {user ? (
                  <div className="flex items-center mt-4 lg:mt-0 relative flex-grow justify-end w-full">
                    <button
                      onClick={() => {
                        setIsOpenDropdown(!isOpenDropdown);
                      }}
                      className={`
                      z-[100] border-none overflow-hidden w-fit max-w-[450px] outline-none 
                      focus:outline-none focus:border-none px-4 py-4 lg:py-2 text-slate-100 
                      transition-colors duration-300 transform rounded-md lg:mt-0 
                      [&:not(.active)]:hover:bg-slate-700 [&:not(.active)]:hover:text-slate-100 
                      cursor-pointer font-bold me-5 lg:me-0 
                      ${
                        isOpenDropdown
                          ? "bg-slate-50 text-slate-900 active"
                          : " bg-slate-800"
                      } }
                      `}
                    >
                      @{user.username}
                    </button>

                    <div
                      className={`z-[99] absolute -top-4 -right-5 me-5 lg:me-0 flex p-5 flex-col gap-1 lg:w-fit 
                    lg:min-w-[350px] lg:max-w-[520px] w-full bg-slate-700/20 backdrop-blur-xl rounded-2xl 
                    text-slate-200 duration-500 shadow-2xl 
                    ${
                      isOpenDropdown
                        ? "opacity-100 visible pt-5 pb-5"
                        : "lg:opacity-0 lg:translate-y-12 lg:invisible lg:pb-10"
                    }`}
                    >
                      <div
                        className={`z-[100] flex justify-between flex-row-reverse gap-5 duration-500 mb-5 
                      ${isOpenDropdown ? "" : "mb-0"} `}
                      >
                        <button
                          onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                          className={`opacity-0 duration-500`}
                        >
                          @{user.username}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-5 z-[100]">
                        <Link
                          onClick={() => {
                            setIsOpenDropdown(false);
                            setIsOpen(false);
                          }}
                          to="/profile"
                          className="flex flex-col justify-center gap-3 font-bold text-sm h-28 text-center text-slate-100 hover:bg-slate-200 bg-slate-500/60 shadow-2xl hover:text-slate-900 rounded-lg duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faFaceSmile}
                            className="text-2xl"
                          />
                          Profil
                        </Link>
                        <Link
                          onClick={() => {
                            setIsOpenDropdown(false);
                            setIsOpen(false);
                          }}
                          to="/live/launch"
                          className="flex flex-col justify-center gap-3 font-bold text-sm h-28 text-center text-slate-100 hover:bg-slate-200 bg-slate-500/60 shadow-2xl hover:text-slate-900 rounded-lg duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faVideo}
                            className="text-2xl"
                          />
                          Lancer un live
                        </Link>
                        <Link
                          onClick={() => {
                            setIsOpenDropdown(false);
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="flex flex-col justify-center gap-3 font-bold text-sm h-28 text-center text-red-100 hover:text-red-100 hover:bg-red-800 bg-red-500/80 shadow-2xl rounded-lg duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faPowerOff}
                            className="text-2xl"
                          />
                          Se déconnecter
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      onClick={() => {
                        setIsOpenDropdown(false);
                        setIsOpen(false);
                      }}
                      to="/signup"
                      className="px-4 py-4 lg:py-2 text-slate-100 transition-colors duration-300 transform rounded-md lg:mt-0 hover:text-slate-100 hover:bg-slate-800 border-2 border-slate-600"
                    >
                      S'inscrire
                    </Link>
                    <Link
                      onClick={() => {
                        setIsOpenDropdown(false);
                        setIsOpen(false);
                      }}
                      to="/login"
                      className="px-4 py-4 lg:py-2 text-slate-900 transition-colors duration-300 transform rounded-md lg:mt-0 hover:text-slate-900 bg-slate-200 hover:bg-slate-50"
                    >
                      Se connecter
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
