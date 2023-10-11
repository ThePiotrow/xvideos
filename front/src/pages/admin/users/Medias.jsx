import { useState, useEffect, useMemo } from "react";
import API from "../../../api";
import { useAuth } from "../../../contexts/authContext";
import MediaIcon from "../../../components/MediaIcon";
import dayjs from "dayjs";
import Details from "../../../components/icons/Details";
import { formatDuration } from "../../../utils/mediaUtils";
import LeftArrow from "../../../components/icons/LeftArrow";
import RightArrow from "../../../components/icons/RightArrows";
import { useLocation, Link } from "react-router-dom";

//import { toast } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function Medias() {
  const [medias, setMedias] = useState([]);
  const { user } = useAuth();
  const query = useQuery();
  const page = Number(query.get("page")) || 1;
  const [total, setTotal] = useState(0);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(total / itemsPerPage);

  const getMedias = async (page) => {
    API.get(`/admin/medias?page=${page}`)
      .then((response) => {
        setMedias(response.data.medias);
        setTotal(response.data.total);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleBlock = async (media) => {
    try {
      const response = await API.put(`/admin/medias/${media.id}`, {
        is_deleted: !media.is_deleted,
      });
      setMedias([
        ...medias.filter((m) => m.id !== media.id),
        response.data.media,
      ]);
    } catch (error) {
      console.log("Il y a un problème avec la récupération des médias" + error);
    }
  };

  useEffect(() => {
    getMedias(page);
  }, [page]);

  return (
    <section className="container px-4 mx-auto">
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
                  {medias.map((media) => (
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
                      <td className="px-12 py-4 text-sm font-normal text-gray-700 whitespace-nowrap">
                        {media.duration
                          ? formatDuration(media.duration)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(media.created_at).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(media.updated_at).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {media.user.username}
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => toggleBlock(media)}
                          className={`text-slate-500 transition-colors duration-200 ${
                            media.is_deleted
                              ? "bg-green-600 text-white hover:bg-green-500 hover:text-white "
                              : "bg-red-600 text-white hover:bg-red-500 hover:text-white "
                          }
                            focus:outline-none`}
                        >
                          {!media.is_deleted ? "Supprimer" : "Récupérer"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <Link
            to={`?page=${page - 1}`}
            className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <LeftArrow />
            <span>précédent</span>
          </Link>

          <div className="items-center hidden md:flex gap-x-3">
            <a
              href="#"
              className="px-2 py-1 text-sm text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60"
            >
              Page {page} / {totalPages}
            </a>
          </div>

          <Link
            to={`?page=${page + 1}`}
            className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <span>Suivant</span>
            <RightArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Medias;
