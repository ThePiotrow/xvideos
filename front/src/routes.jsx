import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import HomePage from "./pages/admin/HomePage";
import AuthGuard from "./guards/AuthGuard";
import Users from "./pages/admin/users/Users"
import useToken from "./hooks/useToken"


function AppRoutes() {
  const { token, setToken } = useToken

  if(!token) {
    return <Routes><Route path="/login" element={<Login setToken={setToken} />} /></Routes>
  }
  return (
    <Routes>
      <Route exact path="/" element={<Home />} />

      {/* IS AUTHENTICATED && IS ADMIN */}
      <Route path="/admin" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/admin/users" element={<AuthGuard><Users /></AuthGuard>} />

    </Routes>
  );
}

export default AppRoutes;