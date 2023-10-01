//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import useToken from "../../hooks/useToken";
import ListMedias from "./ListMedias";
import { useAuth } from "../../contexts/authContext";

function Profile() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <h2>Page de profile de {user.username}</h2>
          <ListMedias />
        </div>
      ) : (
        <div>
          <h2>Page de profile</h2>
        </div>
      )}
    </div>
  );
}

export default Profile;
