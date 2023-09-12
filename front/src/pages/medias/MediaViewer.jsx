import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api"; // Assurez-vous d'avoir un import pour votre module API

function MediaViewer() {
  const { id } = useParams();

  const determineMediaType = (path) => {
    console.log(path)
    const fileExtension = path.split('.').pop().toLowerCase();
    if(['mp4', 'webm', 'ogg'].includes(fileExtension)) return 'video';
    if(['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) return 'image';
    return null;
  }

  const mediaType = determineMediaType(`/medias/${id}/file`);


    return <video width="320" height="240" controls>
      <source src={`/medias/${id}/file`} type="video/mp4" />
          </video>
  }

export default MediaViewer;
