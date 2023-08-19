import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    API.post("/users/login", {
      email: email,
      password: password,
    })
      .then((response) => {
        const token = response.token;
        localStorage.setItem("token", token);
        toast("Vous êtes connecté!");
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Un problème est survenu !");
      });
  };
  return (
    <div className="bg-white white:bg-gray-900">
      <div className="flex justify-center h-screen">
        <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
          <div className="flex-1">
            <div className="text-center">
              <div className="flex justify-center mx-auto"></div>

              <p className="mt-3 text-gray-500 white:text-gray-300">
                Veuillez vous connecter à votre compte
              </p>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm text-gray-600 white:text-gray-200"
                  >
                    Adresse email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="exemple@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="current-password"
                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg white:placeholder-gray-600 white:bg-gray-900 white:text-gray-300 white:border-gray-700 focus:border-blue-400 white:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                </div>

                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="text-sm text-gray-600 white:text-gray-200"
                    >
                      Mot de passe
                    </label>
                    <a
                      href="#"
                      className="text-sm text-gray-400 focus:text-blue-500 hover:text-blue-500 hover:underline"
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg white:placeholder-gray-600 white:bg-gray-900 white:text-gray-300 white:border-gray-700 focus:border-blue-400 white:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                </div>

                <div className="mt-6">
                  <button
                    //onClick={handleSubmit}
                    className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Se connecter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
