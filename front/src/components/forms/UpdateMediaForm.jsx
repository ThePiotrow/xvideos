import API from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

function UpdateMediaForm({ toggleModal, fetchMedias, selectedMediaData }) {
  const [title, setTitle] = useState(selectedMediaData.title || "");
  const [description, setDescription] = useState(
    selectedMediaData.description || ""
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    API.put(`/medias/${selectedMediaData.id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")} `,
      },
    })
      .then((response) => {
        toast.success("Votre vidéo a bien été modifiée!");
        toggleModal("update");
        fetchMedias();
      })
      .catch((error) => {
        toast.error("Un problème est survenu !");
      });
  };

  return (
    <div>
      <h2 className="text-slate-700 dark:text-slate-200 text-lg font-bold text-center mt-4 mb-8">
        Modifier le média {selectedMediaData.title}
      </h2>
      <form>
        <div>
          <label htmlFor="" className="text-slate-700 dark:text-slate-200">
            Titre
          </label>
          <input
            type="text"
            name="titre"
            id="titre"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-4 py-2 mt-2 text-slate-700 bg-white border border-slate-200 rounded-md dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <label htmlFor="" className="text-slate-700 dark:text-slate-200">
            Description
          </label>
          <textarea
            type="test"
            name="Description"
            id="Description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-4 py-2 mt-2 text-slate-700 bg-white border border-slate-200 rounded-md dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="mr-5 px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:bg-slate-600"
            >
              Modifier
            </button>
            <button onClick={() => toggleModal("update")} className="right-0">
              Fermer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default UpdateMediaForm;
