import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (username.length < 3) {
      toast("Le nom d'utilisateur doit comporter au moins 3 caractères.");
      return;
    }

    if (password.length < 6) {
      toast("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    API.post("/users", {
      username: username,
      email: email,
      password: password,
    })
      .then((response) => {
        toast("Vous êtes inscrit!");
        setShowModal(true);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Un problème est survenu !");
      });
  };

  const handleCloseModal = () => {
    setShowModal(false)
    navigate("/login")
  }
  return (
    <section className="flex justify-center items-center mt-14">
      <div className="p-6 max-w-[400px] rounded-xl shadow-2xl bg-slate-800 flex flex-col gap-6 w-full px-6">
        <h2 className="text-xl font-semibold text-white/70 text-center">
          Bienvenue sur <span className="font-black text-white">xVidéos</span>
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-6">
          <div className="flex flex-col gap-3 w-full">
            <label htmlFor="email" className="text-slate-200">Email</label>
            <input
              required
              type="email"
              name="email"
              id="email"
              placeholder="exemple@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="current-password"
              className="block text-lg font-semibold w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border-slate-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>
          <div className="flex flex-col gap-3 w-full">
            <label htmlFor="username" className="text-slate-200">Username</label>
            <input
              required
              type="username"
              name="username"
              id="username"
              placeholder="exemple"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="current-password"
              className="block text-lg font-semibold w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border-slate-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between">
              <label htmlFor="password" className="text-slate-200">Mot de passe</label>
            </div>
            <input
              required
              type="password"
              name="password"
              id="password"
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block text-lg font-semibold w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border-slate-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col gap-3 w-full mt-4">
            <div>
              <button className=" px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:bg-slate-600">S'inscrire</button>
            </div>
            <a
              href="/login"
              className="text-slate-200"
            >
              Déjà un compte ? Connectez-vous !
            </a>
          </div>
        </form>
      </div>

      {
        showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-slate-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-slate-900">Compte actif !</h3>
                      <div className="mt-2">
                        <p className="text-sm text-slate-500">
                          Il s'agit d'un projet étudiant, vous pouvez vous connecter avec votre compte.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button onClick={handleCloseModal} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    J'ai compris
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </section >
  )
}

export default SignUp;