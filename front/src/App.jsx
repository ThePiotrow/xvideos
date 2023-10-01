import "./App.css";
import Header from "./components/Header";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/authContext";
import { Container } from "./components/Container";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faPlay,
  faPause,
  faGear,
  faExpand,
  faCompress,
  faVolumeUp,
  faCheck,
  faCircle,
  faPowerOff,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  library.add(
    faPlay,
    faPause,
    faGear,
    faExpand,
    faCompress,
    faVolumeUp,
    faCheck,
    faCircle,
    faPowerOff,
    faVideo
  );
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Container isOpen={isOpen}>
          <AppRoutes />
          <Header
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isOpenDropdown={isOpenDropdown}
            setIsOpenDropdown={setIsOpenDropdown}
          />
        </Container>
        <div
          className={`absolute z-[98] top-0 left-0 right-0 bottom-0 ${
            isOpenDropdown ? "block" : "hidden"
          }`}
          onClick={() => setIsOpenDropdown(false)}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
