//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Home() {
  const navigate = useNavigate();

  const [medias, setMedias] = useState([]);

  useEffect(() => {
    getAllMedias();
  }, []);

  const getAllMedias = () => {
    API.get("/medias")
    .then(response => {
      setMedias(response.data.medias);
      console.log(response.data)
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des médias", error);
    })
  }
    return (
      <div>
        <h2>Page d‘accueil</h2>
        <ul>
          {medias.map(media => (
            <React.Fragment key={media.id}>
              <li>{media.title}</li>
              <li>{media.description}</li>
              <li>{media.path}</li>
              <li><img src={`medium${media.path}`} alt={media.title} /></li>
            </React.Fragment>

          ))}
        </ul>
        
      </div>
    );
  }
  
  export default Home;