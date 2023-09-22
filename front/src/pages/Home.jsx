import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";

function Home() {
  const navigate = useNavigate();
  const [medias, setMedias] = useState([]);
  const { setToken: setContextToken } = useContext(AuthContext);

  useEffect(() => {
    API.get("/medias")
      .then((response) => {
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
            className="cursor-pointer relative group"
            key={media.id}
            onClick={() => navigate(`/media/${media.id}`)}
          >
            <video
              className="w-full h-44 bg-gray-300 bg-center bg-cover rounded-xl transition-all group-hover:rounded-none hover:duration-700 easy-in-out shadow-lg group-hover:shadow-xl"
              src={media.path}
              preload="metadata"
              muted
              controlsList="nodownload nofullscreen noremoteplayback"
              onLoadedMetadata={(e) => {
                e.target.currentTime = 5; // Charge une frame à 5 secondes de la vidéo pour la prévisualisation
              }}
            />
            <h3 className="mt-2 text-lg font-medium text-gray-600 truncate transition-all duration-500 ease-in-out">
              {media.title}
            </h3>

            <span className="block text-sm text-gray-600">
              {media.description}
            </span>
            {media.path}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
