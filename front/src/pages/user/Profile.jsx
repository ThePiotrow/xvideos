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

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div>
      {user ? (
        <div>
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
