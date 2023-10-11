import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { formatDuration, formatCreatedAt } from "../utils/mediaUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import LeftArrow from "../components/icons/LeftArrow";
import RightArrow from "../components/icons/RightArrows";

function Home() {
  const navigate = useNavigate();
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    API.get("/medias")
      .then((response) => {
        setMedias(response.data?.medias ?? []);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des médias", error);
      });
  }, []);

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ">
      {medias.map((media) => (
        <div
          className="cursor-pointer relative group w-full bg-slate-800 rounded-xl"
          key={media.id}
          onClick={() => navigate(`/media/${media.id}`)}
        >
          <div className="relative group-hover:scale-[1.02] duration-500 aspect-video w-full">
            <img
              className=" bg-gray-300 bg-center bg-cover rounded-xl transition-all aspect-video hover:duration-700 easy-in-out shadow-lg group-hover:shadow-xl object-cover"
              src={media.urls.thumbnail}
              preload="metadata"
            />
            {media.duration && (
              <p className="absolute bottom-3 right-4 text-sm backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-md">
                {formatDuration(media.duration)}
              </p>
            )}
          </div>
          <h3 className="mt-2 text-md font-medium text-slate-200 truncate transition-all duration-500 ease-in-out px-3">
            {media.title}
          </h3>
          <div className="text-xs text-slate-500 flex gap-2 px-3 py-2 items-center justify-between">
            <p>
              {formatCreatedAt(
                dayjs(dayjs()).diff(media.created_at, "seconds")
              )}
            </p>
            <p>@{media.user.username}</p>
          </div>
        </div>
      ))}

      {!medias.length && (
        <div className="flex flex-col items-center justify-center col-span-full mt-12">
          <p className="text-slate-200 text-lg font-medium mb-2">
            Aucun média trouvé
          </p>
          <p className="text-slate-400 text-sm">Revenez plus tard !</p>
        </div>
      )}

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
    </div>
  );
}

export default Home;
