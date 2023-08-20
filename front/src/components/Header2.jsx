<nav className="flex flex-col items-center justify-between p-6 space-y-4 sm:space-y-0 sm:flex-row">
<div className="hidden mx-10 md:block">
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
        </span>
        <input type="text" className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-blue-300" placeholder="Search" />
    </div>
</div>
<div className="hidden lg:flex lg:flex-1 lg:justify-end">
  {user ? (
    <span className="text-sm font semibold leading-6 text-gray-900">
      <img className="object-cover w-12 h-12 rounded-full" src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&h=764&q=100" alt="" />
      <button type="button" onClick={handleLogout} className="ml-6 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">
        Se deconnecter
      </button>
    </span>
  ) : (
    <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">Se connecter</Link>
  )}
</div>
</nav>