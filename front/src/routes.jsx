import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import HomePage from "./pages/admin/HomePage";
import AuthGuard from "./guards/AuthGuard";
import Users from "./pages/admin/users/Users"
import useToken from "./hooks/useToken"
import SignUp from "./pages/auth/SignUp";
import Live from "./pages/live/Live";
import Profile from "./pages/user/Profile";
import EditMedias from "./pages/medias/EditMedias";
import CreateMedias from "./pages/medias/CreateMedias";
import LaunchLive from "./pages/live/LaunchLive";


function AppRoutes() {
  const token = localStorage.getItem("token")

  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/live" element={<Live />} />

      {/* IS AUTHENTICATED */}

      {/* MEDIAS */}
      <Route path="/medias/edit" element={<AuthGuard><EditMedias /></AuthGuard>} />
      <Route path="/medias/create" element={<AuthGuard><CreateMedias /></AuthGuard>} />

      {/* LIVES */}
      <Route path="/lives/launch" element={<AuthGuard><LaunchLive /></AuthGuard>} />

      {/* PROFILE USER */}
      <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />


      {/* IS AUTHENTICATED && IS ADMIN */}
      <Route path="/admin" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/admin/users" element={<AuthGuard><Users /></AuthGuard>} />

    </Routes>
  );
 }

export default AppRoutes;