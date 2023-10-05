//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api";
import { formatDuration } from "../../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../contexts/authContext";

function Lives() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lives, setLives] = useState([]);
  const [liveData, setLiveData] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLiveData((prevLives) =>
        prevLives.map((live) => ({
          ...live,
          elapsedTime: formatDuration(
            dayjs(dayjs()).diff(live.start_time, "seconds")
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    API.get("/lives")
      .then((response) => {
        const livesWithTime = response.data.lives.map((live) => ({
          ...live,
          elapsedTime: formatDuration(
            dayjs(dayjs()).diff(live.start_time, "seconds")
          ),
        }));
        setLiveData(livesWithTime);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des lives", error);
      });
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
                        <span>Titre du live</span>
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
                      Commencé à
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      Arrêté à
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      Streamer
                    </th>

                    <th scope="col" className="relative py-3.5 px-4">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                  {lives.map((live) => (
                    <tr key={live.id}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        <div className="inline-flex items-center gap-x-3">
                          <div className="flex items-center gap-x-2">
                            <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-100 rounded-full dark:bg-gray-800">
                              <MediaIcon type={live.type} />
                            </div>

                            <div>
                              <h2 className="font-normal text-gray-800 dark:text-white ">
                                {live.title}
                              </h2>
                              <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                {live.description
                                  ? live.description
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
                        {live.duration ? formatDuration(live.duration) : "N/A"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(live.created_at).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(live.updated_at).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {live.user.username}
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => toggleBlock(media)}
                          className="text-slate-500 transition-colors duration-200 hover:text-red-500 focus:outline-none"
                        >
                          {!live.isDeleted ? "Supprimer" : "Récupérer"}
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

export default Lives;
