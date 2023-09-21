//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { useAuth } from "../../contexts/authContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import MediaIcon from "../../components/MediaIcon";
import Uploads from "../../components/icons/Uploads";
import Details from "../../components/icons/Details";
import LeftArrow from "../../components/icons/LeftArrow";
import RightArrow from "../../components/icons/RightArrows";
import Trash from "../../components/icons/Trash";
import UploadForm from "../../components/forms/UploadForm";
import DeleteForm from "../../components/forms/DeleteForm";

function ListMedias() {
  const navigate = useNavigate();
  const [medias, setMedias] = useState([]);
  const { token, user } = useAuth();
  const [selectMediaId, setSelectMediaId] = useState(new Set());
  const [modals, setModals] = useState({
    upload: false,
    delete: false,
  });

  const toggleModal = (modalId) => {
    console.log("Toggling modal: ", modalId);
    setModals({
      ...modals,
      [modalId]: !modals[modalId],
    });
  };

  const fetchMedias = () => {
    if (!user) return;
    API.get(`/medias/user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setMedias(response.data.medias);
      })
      .catch((error) => {
        toast.error("Erreur lors de la récupération des médias");
        console.error(error);
      });
  };

  useEffect(() => {
    fetchMedias();
  }, [token, navigate, user]);

  const handleCheckboxChange = (event, mediaId) => {
    const newSelectedMediaIds = new Set(selectMediaId);
    if (event.target.checked) {
      newSelectedMediaIds.add(mediaId);
    } else {
      newSelectedMediaIds.delete(mediaId);
    }
    setSelectMediaId(newSelectedMediaIds);
  };

  return (
    <section className="container px-4 mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
          Mes médias
        </h2>

        <div className="flex items-center mt-4 gap-x-3">
          <button
            onClick={() => toggleModal("upload")}
            className="flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg sm:w-auto gap-x-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:bg-blue-800"
          >
            <Uploads />
            <span>Ajouter</span>
          </button>
          <button
            onClick={() => toggleModal("delete")}
            className="flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-red-500 rounded-lg sm:w-auto gap-x-2 hover:bg-blue-600 dark:hover:bg-red-500 dark:bg-red-800"
          >
            <Trash />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col mt-6">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex items-center gap-x-3">
                        <input
                          type="checkbox"
                          className="text-blue-500 border-gray-300 rounded dark:bg-gray-900 dark:ring-offset-gray-900 dark:border-gray-700"
                        />
                        <span>Nom du fichier</span>
                      </div>
                    </th>

                    <th
                      scope="col"
                      className="px-12 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      Taille du fichier
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      Date d'ajout
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      Dernière modification
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      Ajouter par
                    </th>

                    <th scope="col" className="relative py-3.5 px-4">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                  {medias.map((media) => (
                    <tr key={media.id}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        <div className="inline-flex items-center gap-x-3">
                          <input
                            type="checkbox"
                            onChange={(e) => handleCheckboxChange(e, media.id)}
                            className="text-blue-500 border-gray-300 rounded dark:bg-gray-900 dark:ring-offset-gray-900 dark:border-gray-700"
                          />

                          <div className="flex items-center gap-x-2">
                            <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-100 rounded-full dark:bg-gray-800">
                              <MediaIcon path={media.path} />
                            </div>

                            <div>
                              <h2 className="font-normal text-gray-800 dark:text-white ">
                                {media.title}
                              </h2>
                              <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                720 MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-4 text-sm font-normal text-gray-700 whitespace-nowrap">
                        720 MB
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(media.created_at).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(media.updated_at).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {user.username}
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                        <button className="px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg dark:text-gray-300 hover:bg-gray-100">
                          <Details />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <a
          href="#"
          className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <LeftArrow />
          <span>précédent</span>
        </a>

        <div className="items-center hidden md:flex gap-x-3">
          <a
            href="#"
            className="px-2 py-1 text-sm text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60"
          >
            1
          </a>
          ...
          <a
            href="#"
            className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100"
          >
            14
          </a>
        </div>

        <a
          href="#"
          className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <span>Suivant</span>
          <RightArrow />
        </a>
      </div>

      {modals.upload && (
        <div
          onClick={() => toggleModal("upload")}
          className="fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded p-8 w-4/12"
          >
            <UploadForm toggleModal={toggleModal} fetchMedias={fetchMedias} />
          </div>
        </div>
      )}

      {modals.delete && (
        <div
          onClick={() => toggleModal("delete")}
          className="fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded p-8 w-4/12"
          >
            <DeleteForm
              toggleModal={toggleModal}
              fetchMedias={fetchMedias}
              selectedMediaIds={selectMediaId}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default ListMedias;
