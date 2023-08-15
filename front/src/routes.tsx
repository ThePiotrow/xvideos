import { FC } from 'react';
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import HomePage from "./pages/admin/Home";
import AuthGuard from "./guards/AuthGuard";
import Users from "./pages/admin/users/Users"
import EditUser from "./pages/admin/users/EditUser";
import AddUser from "./pages/admin/users/AddUser";

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* IS AUTHENTICATED && IS ADMIN */}
      <Route path="/admin" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/admin/stocks" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/admin/users" element={<AuthGuard><Users /></AuthGuard>} />
      <Route path="/admin/user/edit" element={<AuthGuard><EditUser /></AuthGuard>} />
      <Route path="/admin/user/add" element={<AuthGuard><AddUser /></AuthGuard>} />
      <Route path="/admin/ingredients" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/admin/users/:id" element={<AuthGuard><EditUser /></AuthGuard>} />
      <Route path="/admin/users/add" element={<AuthGuard><AddUser /></AuthGuard>} />


      {/* ELSE CAN ACCESS LIST OF COCKTAILS */}
      

    </Routes>
  );
}

export default AppRoutes;