import { useState, useEffect } from "react";
import API from "../../../api";
import { useAuth } from "../../../contexts/authContext";
import MediaIcon from "../../../components/MediaIcon";
import dayjs from "dayjs";
import Details from "../../../components/icons/Details";
import { formatDuration } from "../../../utils/mediaUtils";

//import { toast } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";

function Medias() {
  const [medias, setMedias] = useState([]);
  const { user } = useAuth();

  const getMedias = async () => {
    API.get("/medias", {
      params: {
        all: true,
        allUser: true,
      },
    })
      .then((response) => {
        console.log(response);
        setMedias(response.data.medias);
        console.log("this is medias", medias);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleBlock = async (media) => {
    try {
      const response = await API.put(`/admin/medias/${media.id}`, {
        isDeleted: !media.isDeleted,
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
    getMedias();
  }, []);

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
                          <input
                            type="checkbox"
                            onChange={(e) => handleCheckboxChange(e, media.id)}
                            className="text-blue-500 border-gray-300 rounded dark:bg-gray-900 dark:ring-offset-gray-900 dark:border-gray-700"
                          />

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
                          className="text-slate-500 transition-colors duration-200 hover:text-red-500 focus:outline-none"
                        >
                          {!media.isDeleted ? "Supprimer" : "Récupérer"}
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
    </section>
  );
}

export default Medias;
