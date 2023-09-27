import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { formatDuration } from "../utils/mediaUtils";

function Home() {
  const navigate = useNavigate();
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    API.get("/medias")
      .then((response) => {
        console.log("response", response)
        setMedias(response.data.medias);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des médias", error);
      });
  }, []);

  return (
    <div className="m-5">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {medias.map((media) => (
          <div
            className="cursor-pointer relative group max-w-sm overflow-hidden"
            key={media.id}
            onClick={() => navigate(`/media/${media.id}`)}
          >
            <div className="relative group-hover:scale-[1.02] duration-500">
              <img
                className="w-full h-44 bg-gray-300 bg-center bg-cover rounded-xl transition-all  hover:duration-700 easy-in-out shadow-lg group-hover:shadow-xl"
                src={media.urls.thumbnail}
                preload="metadata"
              />
              {media.duration && (
                <p className="absolute bottom-3 right-4 text-sm backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-md">
                  {formatDuration(media.duration)}
                </p>)}
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-600 truncate transition-all duration-500 ease-in-out">
              {media.title}
            </h3>
            <span className="block text-sm text-gray-600">
              {media.description}
            </span>
            <p className="block text-sm text-gray-600">
              {media.user.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
