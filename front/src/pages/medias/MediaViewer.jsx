import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";

function MediaViewer() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    API.get(`/media/${id}`)
      .then((response) => {
        setMedia(response.data.media);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du média", error);
      });
  }, []);

  console.log(useParams());
}

export default MediaViewer;
