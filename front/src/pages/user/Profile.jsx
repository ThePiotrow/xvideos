//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { token } = useToken();
  const hasToken = localStorage.getItem("token")

useEffect(() => {
  if(hasToken) {
    API.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      setUser(response.data.user)
    }).catch((error) => console.error(error))
  }
}, [token]);

    return (
      <div>
        <h2>Page de profile de {user}</h2>
      </div>
    );
  }
  
  export default Profile;