import API from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeleteMediaForm({ toggleModal, fetchMedias, selectedMediaId }) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedMediaId) {
      toast.error("Aucun média sélectionné !");
      return;
    }

    API.delete(`/medias/${selectedMediaId}`)
      .then((response) => {
        toast("Votre vidéo a bien été supprimée!");
        toggleModal("delete");
        fetchMedias();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Un problème est survenu !");
      });
  };

  return (
    <div>
      <h2 className="mb-4 text-gray-700 dark:text-gray-200">
        Voulez-vous vraiment supprimer ce média ?
      </h2>
      <form>
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="mr-5 px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
          >
            confirmer
          </button>
          <button onClick={() => toggleModal("delete")} className="right-0">
            Fermer
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeleteMediaForm;
