//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api";
import { formatDuration } from "../../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faHand, faStop } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../contexts/authContext";
import MediaIcon from "../../../components/MediaIcon";
import { faStopCircle } from "@fortawesome/free-regular-svg-icons";

function Lives() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lives, setLives] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLives((prevLives) =>
        prevLives.map((live) => ({
          ...live,
          elapsedTime: formatDuration(
            dayjs(live.end_time ?? dayjs()).diff(live.start_time, "seconds")
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    API.get("/admin/lives")
      .then((response) => {
        const livesWithTime = response.data.lives.map((live) => ({
          ...live,
          elapsedTime: formatDuration(
            dayjs(dayjs()).diff(live.start_time, "seconds")
          ),
        }));
        setLives(livesWithTime);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des lives", error);
      });
  }, []);

  const toggleBlock = (live) => {
    API.patch(`/lives/${live.id}`, {
      is_ended: !live.is_ended,
    })
      .then((response) => {
        const updatedLives = lives.map((live) =>
          live.id === response.data.live.id ? response.data.live : live
        );
        setLives(updatedLives);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du live", error);
      });
  };

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
                            <div>
                              <h2 className="font-normal text-gray-800 dark:text-white ">
                                {live.title}
                              </h2>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-4 text-sm font-normal text-white whitespace-nowrap">
                        <p className="backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-lg flex gap-2 items-center w-fit">
                          <span
                            className={`absolute h-2 w-2 rounded-full ${
                              !live?.end_time ? "bg-red-500 animate-ping" : ""
                            }`}
                          ></span>
                          <span
                            className={`relative h-2 w-2 rounded-full ${
                              !live?.end_time ? "bg-red-500" : "bg-slate-500"
                            }`}
                          ></span>
                          {live.elapsedTime}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(live.created_at).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {live.end_time
                          ? dayjs(live.end_time).format("DD/MM/YYYY HH:mm:ss")
                          : "En cours"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        @{live.user.username}
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap flex gap-2 items-center">
                        {!live.is_ended && (
                          <>
                            <a
                              href={`/live/${live.user.username}`}
                              className="text-slate-500 transition-colors duration-200 py-2 px-4 hover:text-slate-600 focus:outline-none bg-slate-400 hover:bg-slate-500 rounded-lg"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </a>
                            <button
                              onClick={() => toggleBlock(live)}
                              className="text-slate-500 transition-colors duration-200 py-2 px-4 hover:text-red-500 focus:outline-none flex items-center gap-2"
                            >
                              <FontAwesomeIcon className="" icon={faHand} />
                              Arrêter
                            </button>
                          </>
                        )}
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
