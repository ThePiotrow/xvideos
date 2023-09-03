//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import useToken from "../../hooks/useToken";

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
        {user ? (
          <h2>Page de profile de {user.username}</h2>
        ):(
          <div>
            <h2>Page de profile</h2>
          </div>
          
        )}
      </div>
    );
  }
  
  export default Profile;