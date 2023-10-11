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
  const [progress, setProgress] = useState(0);

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
      onUploadProgress: (progressEvent) => {
        const p = (progressEvent.loaded / progressEvent.total) * 100;
        setProgress(p.toFixed(2));
        if (!(p < 100)) {
          toast.success(
            "Votre média est en cours de conversion ! Il sera bientôt disponible"
          );
          toggleModal();
          fetchMedias();
          setLoading(false);
          toggleModal("upload");
        }
      },
    })
      .then((response) => {
        toast.success("Votre media a bien été uploadée!");
        toggleModal();
        fetchMedias();
        setLoading(false);
        toggleModal("upload");
      })
      .catch((error) => {
        toast.error("Un problème est survenu !");
        setLoading(false);
      });
  };

  return (
    <div>
      <h2 className="text-slate-700 dark:text-slate-200 text-lg font-bold text-center mt-4 mb-8">
        Ajouter un média
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
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <label
              htmlFor="media"
              className="text-slate-700 dark:text-slate-200"
            >
              Fichier
            </label>
          </div>
          <input
            type="file"
            accept="image/*,video/*"
            name="media"
            id="media"
            onChange={(e) => setMedia(e.target.files[0])}
            className="block w-full px-4 py-2 mt-2 text-slate-700 bg-white border border-slate-200 rounded-md dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <label
              htmlFor="thumbnail"
              className="text-slate-700 dark:text-slate-200"
            >
              Miniature
            </label>
          </div>
          <input
            type="file"
            accept="image/*"
            name="thumbnail"
            id="thumbnail"
            onChange={(e) => setThumbnail(e.target.files[0])}
            className="block w-full px-4 py-2 mt-2 text-slate-700 bg-white border border-slate-200 rounded-md dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mr-5 px-8 py-2.5 disabled:opacity-30 disabled:border-none disabled:hover:bg-slate-700 disabled:cursor-not-allowed leading-5 text-white transition-colors duration-300 transform bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:bg-slate-600"
          >
            {!loading && "Ajouter"}
            {loading && (
              <span>
                <FontAwesomeIcon
                  className="z-30 text-lg self-start mr-2 animate-spin"
                  icon={faCircleNotch}
                />
                Ajout en cours ({progress}%)
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
