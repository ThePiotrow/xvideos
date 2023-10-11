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
      <h2 className="text-slate-200 text-lg font-bold text-center mt-4 mb-8">
        Voulez-vous vraiment supprimer ce média ?
      </h2>
      <form>
        <div className="mt-6 flex justify-center gap-6">
          <button onClick={() => toggleModal("delete")} className="right-0 bg-slate-600">
            Fermer
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-red-700 rounded-md hover:bg-red-600 border-none focus:outline-none focus:bg-red-600"
          >
            Confirmer
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeleteMediaForm;
