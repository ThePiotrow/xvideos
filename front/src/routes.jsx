import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import HomePage from "./pages/admin/HomePage";
import AuthGuard from "./guards/AuthGuard";
import Users from "./pages/admin/users/Users"
import useToken from "./hooks/useToken"
import SignUp from "./pages/auth/SignUp";


function AppRoutes() {
  const token = localStorage.getItem("token")

  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/signup" element={<AuthGuard><SignUp /></AuthGuard>} />

      {/* IS AUTHENTICATED && IS ADMIN */}
      <Route path="/admin" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/admin/users" element={<AuthGuard><Users /></AuthGuard>} />

    </Routes>
  );
 }

export default AppRoutes;