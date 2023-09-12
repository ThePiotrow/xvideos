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
      //API.get(`/medias/${medias[0].id}/file`).then(res => console.log(res))
      console.log(response.data.medias[0])
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
              <a onClick={() => navigate(`/media/${media.id}`)}>
                {media.title}
              </a>
              <li>{media.description}</li>
              <li>{media.path}</li>
              <li><img src={``} alt="" /></li>
            </React.Fragment>
          ))}
        </ul>
        
      </div>
    );
  }
  
  export default Home;