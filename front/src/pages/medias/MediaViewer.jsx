import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";
import { VideoJS } from "../../components/VideoJS";

function MediaViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [media, setMedia] = useState(null);

  useEffect(() => {
    API.get(`/medias/${id}`)
      .then((response) => {
        setMedia(response.data.media);
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération du média ou de l'utilisateur",
          error
        );
      });
  }, [id]);

  const handlePlayerReady = () => {
    const player = playerRef.current;
    if (player && player.getInternalPlayer) {
      const internalPlayer = player.getInternalPlayer();

      if (internalPlayer && internalPlayer.on) {
        internalPlayer.on("waiting", () => console.log("player is waiting"));
        internalPlayer.on("dispose", () => console.log("player will dispose"));
      }
    }
  };

  window.HELP_IMPROVE_VIDEOJS = false;

  return (
    <div>
      {media ? (
        <>
          {media.type === "video" ? (
            <VideoJS
              hls={media.urls.hls}
              thumbnail={media.urls.thumbnail}
              duration={media.duration}
            />
          ) : media.type === "image" ? (
            <img
              className="max-h-96 rounded-lg mx-auto"
              src={media.urls.original}
              alt={media.title}
            />
          ) : (
            <p>Format non pris en charge</p>
          )}
          <h2 className="mt-5 text-2xl font-medium text-slate-100">
            {media.title}
          </h2>
          {media.user && (
            <p className="mt-4 text-slate-600">
              Publié par : {media.user.username}
            </p>
          )}
          <p className="mt-2 text-slate-500">{media.description}</p>
        </>
      ) : (
        <p>Ce Média n'est pas disponible...</p>
      )}
    </div>
  );
}

export default MediaViewer;
