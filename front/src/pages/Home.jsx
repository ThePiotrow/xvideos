import React, { useState, useEffect, useRef } from "react";
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
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);



  useEffect(() => {
    API.get(`/medias?limit=${limit}&page=${page}`)
      .then((response) => {
        setTotal(response.data.total);

        const filteredMedias = response.data.medias.filter(
          (media) => !medias.find((m) => m.id === media.id)
        );

        setMedias([...medias, ...(filteredMedias ?? [])]);
        setPages(Math.ceil(response.data.total / limit));
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des médias", error);
      });
  }, [page, pages]);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [medias]);

  return (
    <>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ">
        {medias.map((media) => (
          <div
            className="cursor-pointer relative group w-full bg-slate-800 rounded-xl"
            key={media.id}
            onClick={() => navigate(`/media/${media.id}`)}
          >
            <div className="relative group-hover:scale-[1.02] duration-500 aspect-video w-full">
              <img
                className=" bg-slate-300 bg-center bg-cover rounded-xl transition-all aspect-video hover:duration-700 easy-in-out shadow-lg group-hover:shadow-xl object-cover"
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

      </div>

      <div className="flex items-center justify-center mt-6">
        <button
          disabled={page >= pages}
          onClick={() => setPage((prevPage) => prevPage + 1)}
          className="px-5 py-2 text-sm text-slate-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Afficher plus
        </button>
      </div>
    </>
  );
}

export default Home;
