import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import API from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";

interface Params {
  id: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams<Params>();
  
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const getUser = async () => {
    await API.get<UserData>(`/users/${id}`,{
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
    })
      .then((res) => {
        setFirstName(res.data.firstName);
        setLastName(res.data.lastName);
        setEmail(res.data.email);
        setPassword(res.data.password);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    getUser();
  }, [id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    API.patch(`/users/${id}`, {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
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

  return (
    <section className="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md">
    <h2 className="text-lg font-semibold text-gray-700 capitalize">Modifier profile</h2>

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

export default EditUser;
