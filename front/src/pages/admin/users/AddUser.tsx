import { useState, ChangeEvent, FormEvent } from 'react';
import API from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function AddUser() {
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    API.post("/auth/register", {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    })
      .then(() => {
        toast("L'utilisateur a bien été enregistré");
        navigate("/admin/users");
      })
      .catch(error => {
        console.log(error);
        toast.error("Un problème est survenu !");
      });
  };

  const handleInputChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  return (
    <section className="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md">
    <h2 className="text-lg font-semibold text-gray-700 capitalize">Ajouter un utilisateur</h2>

    <form>
        <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div>
                <label className="text-gray-700" htmlFor="firstName">Prénom</label>
                <input
                id="firstName" 
                name="firstName" 
                value={firstName} 
                placeholder="John"
                onChange={(e) => setFirstName(e.target.value)}  
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                type="text"
                />
            </div>

            <div>
                <label className="text-gray-700" htmlFor="lastName">Nom</label>
                <input
                id="lastName" 
                name="lastName" 
                value={lastName} 
                placeholder="Doe"
                onChange={(e) => setLastName(e.target.value)}  
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                type="text"
                />
            </div>

            <div>
                <label className="text-gray-700" htmlFor="email">Email Address</label>
                <input
                id="email" 
                name="email" 
                value={email} 
                placeholder="exemple@exemple.com"
                onChange={(e) => setEmail(e.target.value)}  
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                type="text"
                />
            </div>

            <div>
                <label className="text-gray-700" htmlFor="password">Password</label>
                <input             
                type="password"
                id="password" 
                name="password"
                placeholder="Votre mot de passe"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring" />
            </div>
        </div>

        <div className="flex justify-end mt-6">
            <button onClick={handleSubmit} className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">Save</button>
        </div>
    </form>
</section>
  )
}

export default AddUser;
