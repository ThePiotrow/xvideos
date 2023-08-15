import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TextField, Button, Typography, Container, Grid, Link } from "@mui/material";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    API.post("/users/login", {
      email: email,
      password: password,
    })
      .then(response => {
        const token = response.data;
        console.log(token);
        localStorage.setItem("token", token);
        toast("Vous êtes connecté!");
        navigate("/admin");
      })
      .catch(error => {
        console.log(error);
        toast.error("Un problème est survenu !");
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Typography variant="h5" align="center">
        Veuillez vous connecter à votre compte
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Adresse email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Mot de passe"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Grid container>
          <Grid item xs>
            <Link href="#" variant="body2">
              Mot de passe oublié ?
            </Link>
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Se connecter
        </Button>
      </form>
    </Container>
  );
}

export default Login;
