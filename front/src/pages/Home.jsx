//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Home() {
  const navigate = useNavigate();
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    API.get("/medias")
    .then(response => {
      setMedias(response.data.medias);
      console.log(response.data)
      console.log(`${import.meta.env.VITE_BASE_URI}:${import.meta.env.VITE_API_GATEWAY_PORT}/uploads/`);
      
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des médias", error);
    })
  }, []);

    return (
      <div className="m-5">
        <h1 className="mb-5">Page d‘accueil</h1>
        <ul>
          {medias.map(media => (
            <React.Fragment key={media.id}>
              <li>{media.title}</li>
              <li>{media.description}</li>
              <li>{media.path}</li>
              <li><img src={`${import.meta.env.VITE_BASE_URI}:${import.meta.env.VITE_API_GATEWAY_PORT}/medias/${media.path}/file`} alt={media.title} /></li>
            </React.Fragment>
          ))}
        </ul>
        
      </div>
    );
  }
  
  export default Home;