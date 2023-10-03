import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import HomePage from "./pages/admin/HomePage";
import AuthGuard from "./guards/AuthGuard";
import Users from "./pages/admin/users/Users";
import useToken from "./hooks/useToken";
import SignUp from "./pages/auth/SignUp";
import Live from "./pages/live/Live";
import Profile from "./pages/user/Profile";
import ListMedias from "./pages/user/ListMedias";
import MediaViewer from "./pages/medias/MediaViewer";
import Viewer from "./pages/live/Viewer";
import Streamer from "./pages/live/Streamer";

function AppRoutes() {
  const token = localStorage.getItem("token");

  return (
    <div className="mt-8">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lives" element={<Live />} />
        <Route path="/media/:id" element={<MediaViewer />} />

        {/* IS AUTHENTICATED */}

        {/* MEDIAS */}
        <Route
          path="/medias"
          element={
            <AuthGuard>
              <ListMedias />
            </AuthGuard>
          }
        />
        <Route
          path="/medias/edit"
          element={
            <AuthGuard>
              <ListMedias />
            </AuthGuard>
          }
        />

        {/* LIVES */}
        <Route
          path="/live"
          element={
            <AuthGuard>
              <Streamer />
            </AuthGuard>
          }
        />

        {/* PROFILE USER */}
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />

        {/* IS AUTHENTICATED && IS ADMIN */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AuthGuard>
              <Users />
            </AuthGuard>
          }
        />
        <Route path="/live/:username" element={<Viewer />} />
      </Routes>
    </div>
  );
}

export default AppRoutes;
