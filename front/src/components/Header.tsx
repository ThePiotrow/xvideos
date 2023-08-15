import { useState, useEffect, ReactElement } from "react";
import { Dialog, Popover } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import API from "../api"

type User = {
  firstName: string;
  lastName: string;
};

export default function Header(): ReactElement {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage?.getItem("token"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        setUser(response.data) // je suppose que le user est dans response.data
      }).catch((error) => console.error(error))
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null)
    setUser(null);
    navigate("/login")
  };

  return (
    <header className="bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <img className="h-8 w-auto" src="" alt="" />
          </Link>
        </div>
        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          <a
            href="/admin/cocktails"
            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
          >
            Cocktails
          </a>
          <a
            href="/admin/ingredients"
            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
          >
            Stock
          </a>
          <a
            href="/admin/users"
            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
          >
            Utilisateurs
          </a>
        </Popover.Group>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <span className="text-sm font semibold leading-6 text-gray-900">
              Bienvenue {user.firstName} {user.lastName}
              <button
                type="button"
                onClick={handleLogout}
                className="ml-6 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
              >
                Se deconnecter
              </button>
            </span>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold leading-6 text-gray-900"
            >Log in
              <span aria-hidden="true">&rarr;</span>
            </Link>
          )}

        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">

                <a
                  href="/admin/cocktails"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Cocktails
                </a>
                <a
                  href="/admin/stocks"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Stock
                </a>
                <a
                  href="/admin/users"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Users
                </a>
              </div>
              <div className="py-6">
                <Link to="/login">Login</Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}