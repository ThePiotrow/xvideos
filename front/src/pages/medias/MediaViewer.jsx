import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";

function MediaViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [user, setUser] = useState(null);

  const isVideo = (path) => {
    const ext = path.split(".").pop();
    return ["mp4", "webm", "ogg"].includes(ext.toLowerCase());
  };

  const isImage = (path) => {
    const ext = path.split(".").pop();
    return ["jpg", "jpeg", "png", "gif"].includes(ext.toLowerCase());
  };

  useEffect(() => {
    API.get(`/medias/${id}`)
      .then((response) => {
        setMedia(response.data.media);
        return API.get(`/users/${response.data.media.user_id}`);
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération du média ou de l'utilisateur",
          error
        );
      });
  }, [id]);

  return (
    <div className="ml-20">
      {media ? (
        <div className="block px-4 py-2 z-50  max-w-7xl">
          {isVideo(media.path) ? (
            <video
              className="w-full rounded-md"
              src={media.path}
              controls
              autoPlay
            />
          ) : isImage(media.path) ? (
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
          {user && (
            <p className="mt-4 text-gray-600">Publié par : {user.username}</p>
          )}
          <p className="mt-2 text-gray-500">{media.description}</p>
        </div>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}

export default MediaViewer;
