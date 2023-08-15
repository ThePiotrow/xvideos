import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

type User = {
  firstName: string;
  lastName: string;
};

export default function Header(): React.ReactElement {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage?.getItem("token"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      API.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        setUser(response.data)
      }).catch((error) => console.error(error))
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMobileMenuOpen(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(null);
  };

  return (
    <AppBar position="sticky" color="default">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMobileMenuOpen}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Mon Application
        </Typography>

        {user ? (
          <>
            <Typography variant="body1">
              Bienvenue {user.firstName} {user.lastName}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Se déconnecter
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button color="inherit">Log in</Button>
          </Link>
        )}

      </Toolbar>

      <Menu
        anchorEl={mobileMenuOpen}
        open={Boolean(mobileMenuOpen)}
        onClose={handleMobileMenuClose}
      >
        <MenuItem component={Link} to="/admin/cocktails" onClick={handleMobileMenuClose}>Cocktails</MenuItem>
        <MenuItem component={Link} to="/admin/ingredients" onClick={handleMobileMenuClose}>Stock</MenuItem>
        <MenuItem component={Link} to="/admin/users" onClick={handleMobileMenuClose}>Utilisateurs</MenuItem>
      </Menu>
    </AppBar>
  );
}
