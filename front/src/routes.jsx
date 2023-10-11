import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import AuthGuard from "./guards/AuthGuard";
import AdminGuard from "./guards/AdminGuard";
import Users from "./pages/admin/Users";
import useToken from "./hooks/useToken";
import SignUp from "./pages/auth/SignUp";
import Live from "./pages/live/Live";
import Profile from "./pages/user/Profile";
import ListMedias from "./pages/user/ListMedias";
import MediaViewer from "./pages/medias/MediaViewer";
import Viewer from "./pages/live/Viewer";
import Streamer from "./pages/live/Streamer";
import NotFoundPage from "./pages/NotFoundPage";
import Medias from "./pages/admin/Medias";
import Lives from "./pages/admin/Lives";

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
          path="/admin/users"
          element={
            <AuthGuard>
              <AdminGuard>
                <Users />
              </AdminGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/medias"
          element={
            <AuthGuard>
              <AdminGuard>
                <Medias />
              </AdminGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/lives"
          element={
            <AuthGuard>
              <AdminGuard>
                <Lives />
              </AdminGuard>
            </AuthGuard>
          }
        />
        <Route path="/live/:username" element={<Viewer />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default AppRoutes;
