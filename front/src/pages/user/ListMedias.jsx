//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { useAuth } from "../../contexts/authContext";
import { toast } from "react-toastify";
import { formatDuration, formatCreatedAt } from "../../utils/mediaUtils";
import dayjs from "dayjs";
import MediaIcon from "../../components/MediaIcon";
import Uploads from "../../components/icons/Uploads";
import Details from "../../components/icons/Details";
import LeftArrow from "../../components/icons/LeftArrow";
import RightArrow from "../../components/icons/RightArrows";
import Trash from "../../components/icons/Trash";
import UploadMediaForm from "../../components/forms/UploadMediaForm";
import DeleteMediaForm from "../../components/forms/DeleteMediaForm";
import UpdateMediaForm from "../../components/forms/UpdateMediaForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faRotateRight } from "@fortawesome/free-solid-svg-icons";

function ListMedias() {
  const navigate = useNavigate();
  const [medias, setMedias] = useState([]);
  const { token, user } = useAuth();
  const [selectMediaId, setSelectMediaId] = useState(null);
  const [updateMediaData, setUpdateMediaData] = useState(null);
  const [modals, setModals] = useState({
    upload: false,
    delete: false,
    update: false,
  });

  const toggleModal = (modalId) => {
    setSelectMediaId(null);
    setModals({
      ...modals,
      [modalId]: !modals[modalId],
    });
  };

  const fetchMedias = () => {
    if (!user) return;
    API.get(`/users/me/medias`)
      .then((response) => {
        setMedias(response.data?.user?.medias);
      })
      .catch((error) => {
        toast.error("Erreur lors de la récupération des médias");
        console.error(error);
      });
  };

  useEffect(() => {
    fetchMedias();
  }, [token, navigate, user]);

  const restoreMedia = (mediaId) => {
    API.put(`/medias/${mediaId}`, { is_deleted: false })
      .then((response) => {
        setMedias([
          ...medias.filter((m) => m.id !== mediaId),
          response.data.media,
        ]);
        toast.success("Média restauré avec succès");
      })
      .catch((error) => {
        toast.error("Erreur lors de la restauration du média");
        console.error(error);
      });
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
                        <span>Nom du fichier</span>
                      </div>
                    </th>

                    <th
                      scope="col"
                      className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex items-center gap-x-3">
                        <span>Status</span>
                      </div>
                    </th>

                    <th
                      scope="col"
                      className="px-12 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      Durée
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
                  {medias !== null ? (
                    medias.length > 0 ? (
                      medias.map((media) => (
                        <tr key={media.id}>
                          <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                            <div className="inline-flex items-center gap-x-3">
                              <div className="flex items-center gap-x-2">
                                <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-100 rounded-full dark:bg-gray-800">
                                  <MediaIcon type={media.type} />
                                </div>

                                <div>
                                  <h2 className="font-normal text-gray-800 dark:text-white ">
                                    {media.title}
                                  </h2>
                                  <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                    {media.description
                                      ? media.description
                                          .split(" ")
                                          .splice(0, 5)
                                          .join(" ") + "..."
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-12 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full gap-x-2 ${
                                !media.is_deleted
                                  ? "bg-emerald-600/60"
                                  : "bg-red-400/40"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  !media.is_deleted
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              ></span>
                              <h2
                                className={`text-sm font-normal ${
                                  !media.is_deleted
                                    ? "text-emerald-500"
                                    : "text-red-500"
                                }`}
                              >
                                {!media.is_deleted
                                  ? "En ligne"
                                  : "Indisponible"}
                              </h2>
                            </div>
                          </td>
                          <td className="px-12 py-4 text-sm font-normal text-gray-700 whitespace-nowrap">
                            {media.duration
                              ? formatDuration(media.duration)
                              : "N/A"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                            {dayjs(media.created_at).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                            {dayjs(media.updated_at).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                            {user.username}
                          </td>

                          <td className="flex gap-2 px-4 py-4 text-sm whitespace-nowrap">
                            <button
                              onClick={() => {
                                if (!media.is_deleted) {
                                  console.log(media.id);
                                  toggleModal("delete");
                                  setSelectMediaId(media.id);
                                } else restoreMedia(media.id);
                              }}
                              className={`text-slate-500 transition-colors duration-200 ${
                                media.is_deleted
                                  ? "bg-green-600 text-white hover:bg-green-500 hover:text-white "
                                  : "bg-red-600 text-white hover:bg-red-500 hover:text-white "
                              }
                                focus:outline-none`}
                            >
                              {!media.is_deleted ? (
                                <Trash />
                              ) : (
                                <FontAwesomeIcon icon={faRotateRight} />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                toggleModal("update");
                                setUpdateMediaData({
                                  id: media.id,
                                  title: media.title,
                                  description: media.description,
                                });
                              }}
                              className="max-h-11 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faPencil} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-12 py-4 text-sm font-normal text-gray-700 whitespace-nowrap">
                          <p>Ajoutez votre première image ou vidéo</p>
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td className="px-12 py-4 text-sm font-normal text-gray-700 whitespace-nowrap">
                        <p>Ajoutez votre première image ou vidéo</p>
                      </td>
                    </tr>
                  )}
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
        </div>

        <a
          href="#"
          className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <span>Suivant</span>
          <RightArrow />
        </a>
      </div>

      {/* MODAL ADD */}
      {modals.upload && (
        <div
          onClick={() => toggleModal("upload")}
          className="fixed top-0 left-0 z-[500] w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded p-8 xl:w-4/12"
          >
            <UploadMediaForm
              toggleModal={toggleModal}
              fetchMedias={fetchMedias}
            />
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {modals.delete && (
        <div
          onClick={() => toggleModal("delete")}
          className="fixed top-0 left-0 z-[500] w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded p-8 xl:w-4/12"
          >
            <DeleteMediaForm
              toggleModal={toggleModal}
              fetchMedias={fetchMedias}
              selectedMediaId={selectMediaId}
            />
          </div>
        </div>
      )}

      {/* MODAL UPDATE */}
      {modals.update && (
        <div
          onClick={() => toggleModal("update")}
          className="fixed top-0 left-0 z-[500] w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded p-8 xl:w-4/12"
          >
            <UpdateMediaForm
              toggleModal={toggleModal}
              fetchMedias={fetchMedias}
              selectedMediaData={updateMediaData}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default ListMedias;
