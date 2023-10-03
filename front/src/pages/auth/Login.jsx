import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setToken: setContextToken } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    API.post("/users/login", {
      username: username,
      password: password,
    })
      .then((response) => {
        const token = response.data.token;
        localStorage.setItem("token", token);
        setContextToken(token);
        toast("Vous êtes connecté!");
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Un problème est survenu !");
      });
  };

  return (
    <section className="flex justify-center items-center mt-14">
      <div className="p-6 max-w-[400px] rounded-xl shadow-2xl bg-slate-800 flex flex-col gap-6 w-full px-6">
        <h2 className="text-xl font-semibold text-white/70 text-center">
          Bienvenue sur <span className="font-black text-white">xVidéos</span>
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-6">
          <div className="flex flex-col gap-3 w-full">
            <label
              htmlFor="username"
              className="text-slate-200"
            >
              Nom d'utilisateur
            </label>
            <input
              required
              type="username"
              name="username"
              id="username"
              placeholder="exemple"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="current-password"
              className="block text-lg font-semibold w-full px-4 py-2 rounded-lg bg-slate-700 text-gray-300 border-gray-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="text-slate-200"
              >
                Mot de passe
              </label>
            </div>
            <input
              required
              type="password"
              name="password"
              id="password"
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block text-lg font-semibold w-full px-4 py-2 rounded-lg bg-slate-700 text-gray-300 border-gray-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col gap-3 w-full mt-4">
            <div>
              <button className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:bg-slate-600">
                Se connecter
              </button>
            </div>
            <a
              href="/signup"
              className="text-slate-200"
            >
              Pas encore de compte ? Inscrivez-vous !
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Login;
