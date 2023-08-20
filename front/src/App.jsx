import "./App.css";
import Header from "./components/Header";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="wrapper">
      <BrowserRouter>
        <ToastContainer />
        <Header />
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;