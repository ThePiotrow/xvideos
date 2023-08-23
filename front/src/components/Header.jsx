import { useState, useEffect } from "react";
//import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import useToken from "../hooks/useToken";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const { token } = useToken();

useEffect(() => {
  if(token) {
    API.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      setUser(response.data.user)
    }).catch((error) => console.error(error))
  }
}, [token]);

  const handleLogout = () => {
    // localStorage.removeItem("token");
    // setUser(null);
    // navigate("/login");
    API.put('/users/logout', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(() => {
        setUser(null)
        navigate("/login")
    }).catch((error) => console.error(error))
  };

  return (
    <header>
      <nav x-data="{ isOpen: false }" className="transparent">
          <div className="container px-6 py-4 mx-auto">
              <div className="lg:flex lg:items-center">
                  <div className="flex items-center justify-between">
                      <a href="#">
                          <img className="w-auto h-6 sm:h-7" src="https://merakiui.com/images/full-logo.svg" alt="" />
                      </a>

                      <div className="flex lg:hidden">
                          <button x-cloak="true" click="isOpen = !isOpen" type="button" className="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400" aria-label="toggle menu" />
                              <svg x-show="!isOpen" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                              </svg>
                      
                              <svg x-show="isOpen" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                      </div>
                  </div>

                  <div x-cloak="true" className="[isOpen ? 'translate-x-0 opacity-100 ' : 'opacity-0 -translate-x-full'] absolute inset-x-0 z-20 flex-1 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center lg:justify-between">
                      <div className="flex flex-col text-gray-600 capitalize dark:text-gray-300 lg:flex lg:px-16 lg:-mx-4 lg:flex-row lg:items-center">
                          <a href="#" className="mt-2 transition-colors duration-300 transform lg:mt-0 lg:mx-4 hover:text-gray-900 dark:hover:text-gray-200">features</a>
                          <a href="#" className="mt-2 transition-colors duration-300 transform lg:mt-0 lg:mx-4 hover:text-gray-900 dark:hover:text-gray-200">downloads</a>
                          <a href="#" className="mt-2 transition-colors duration-300 transform lg:mt-0 lg:mx-4 hover:text-gray-900 dark:hover:text-gray-200">docs</a>
                          <a href="#" className="mt-2 transition-colors duration-300 transform lg:mt-0 lg:mx-4 hover:text-gray-900 dark:hover:text-gray-200">support</a>
                          <a href="#" className="mt-2 transition-colors duration-300 transform lg:mt-0 lg:mx-4 hover:text-gray-900 dark:hover:text-gray-200">blog</a>
          
                          <div className="relative mt-4 lg:mt-0 lg:mx-4">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none">
                                      <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg>
                              </span>
          
                              <input type="text" className="w-full py-1 pl-10 pr-4 text-gray-700 placeholder-gray-600 bg-white border-b border-gray-600 dark:placeholder-gray-300 dark:focus:border-gray-300 lg:w-56 lg:border-transparent dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:border-gray-600" placeholder="Search" />
                          </div>
                      </div>
          
                      <div className="flex justify-center mt-6 lg:flex lg:mt-0 lg:-mx-2">
                        {user ? (
                            <Link onClick={handleLogout} className="mt-2 transition-colors duration-300 transform lg:mt-0 lg:mx-4 hover:text-gray-900 dark:hover:text-gray-200">Se déconnecter</Link>
                        ) : (
                            <Link to="/login" className="mt-2 transition-colors duration-300 transform lg:mt-0 lg:mx-4 hover:text-gray-900 dark:hover:text-gray-200">Se connecter</Link>
                        )}
                      </div>
                  </div>
              </div>
          </div>
      </nav>
    </header>
  );
}
