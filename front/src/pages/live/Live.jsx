//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

function Live() {
  const navigate = useNavigate();
  const [lives, setLives] = useState([]);

  useEffect(() => {
    API.get("/lives")
    .then(response => {
      setLives(response.data.Live)
      console.log(response.data)
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des lives", error);
    })
  }, []);

    return (
      <div>
        <h2>Page des lives</h2>
      </div>
    );
  }
  
  export default Live;