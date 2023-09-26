import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
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

  const handlePlayerReady = (player) => {
    // Handle player events here if necessary
    player.on('waiting', () => videojs.log('player is waiting'));
    player.on('dispose', () => videojs.log('player will dispose'));
  };

  window.HELP_IMPROVE_VIDEOJS = false;

  return (
    <div className="ml-20">
      {media ? (
        <div className="block px-4 py-2 z-50 max-w-7xl">
          {media.type === 'video' ? (
            <VideoJS media={media} onReady={handlePlayerReady} />
          ) : media.type === 'image' ? (
            <img
              className="w-full rounded-lg"
              src={media.path}
              alt={media.title}
            />
          ) : (
            <p>Format non pris en charge</p>
          )}
          <h2 className="mt-5 text-2xl font-medium text-gray-100">
            {media.title}
          </h2>
          {media.user && (
            <p className="mt-4 text-gray-600">Publié par : {media.user.username}</p>
          )}
          <p className="mt-2 text-gray-500">{media.description}</p>
        </div>
      ) : (
        <p>Chargement...</p>
      )
      }
    </div >
  );
}

export default MediaViewer;
