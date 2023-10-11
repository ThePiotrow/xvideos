import { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faCircle, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function UploadMediaForm({ toggleModal, fetchMedias }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("media", media);
    formData.append("thumbnail", thumbnail);

    setLoading(true);
    API.post("/medias", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 3600000,
    })
      .then((response) => {
        console.log("Response from server:", response);
        toast("Votre media a bien été uploadée!");
        toggleModal();
        fetchMedias();
        setLoading(false);
        toggleModal("upload");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Un problème est survenu !");
        setLoading(false);
      });
  };

  return (
    <div>
      <h2 className="mb-4 text-gray-700 dark:text-gray-200">
        Ajouter un média
      </h2>
      <form>
        <div>
          <label htmlFor="" className="text-gray-700 dark:text-gray-200">
            Titre
          </label>
          <input
            type="text"
            name="titre"
            id="titre"
            placeholder="titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <label htmlFor="" className="text-gray-700 dark:text-gray-200">
            Description
          </label>
          <textarea
            type="test"
            name="Description"
            id="Description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <label htmlFor="media" className="text-gray-700 dark:text-gray-200">
              Fichier
            </label>
          </div>
          <input
            type="file"
            name="media"
            id="media"
            onChange={(e) => setMedia(e.target.files[0])}
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <label
              htmlFor="thumbnail"
              className="text-gray-700 dark:text-gray-200"
            >
              Miniature
            </label>
          </div>
          <input
            type="file"
            name="thumbnail"
            id="thumbnail"
            onChange={(e) => setThumbnail(e.target.files[0])}
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mr-5 px-8 py-2.5 disabled:opacity-30 disabled:border-none disabled:hover:bg-gray-700 disabled:cursor-not-allowed leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
          >
            {!loading && "Ajouter"}
            {loading && (
              <span>
                <FontAwesomeIcon
                  className="z-30 text-lg self-start mr-2 animate-spin"
                  icon={faCircleNotch}
                />
                Ajout en cours
              </span>
            )}
          </button>
          <button onClick={() => toggleModal("upload")} className="right-0">
            Fermer
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadMediaForm;
