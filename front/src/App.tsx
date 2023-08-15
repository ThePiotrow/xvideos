import "./App.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@mui/material/styles';
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { ReactElement } from "react";
import Header from "./components/Header";
import AppRoutes from "./routes";
import Footer from "./components/Footer";

function App(): ReactElement {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Header />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
