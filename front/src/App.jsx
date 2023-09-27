import "./App.css";
import Header from "./components/Header";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/authContext";
import { Container } from "./components/Container";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPause, faGear, faExpand, faCompress, faVolumeUp, faCheck, faCircle, faPowerOff, faVideo } from '@fortawesome/free-solid-svg-icons';

function App() {

  library.add(faPlay, faPause, faGear, faExpand, faCompress, faVolumeUp, faCheck, faCircle, faPowerOff, faVideo);
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Container>
          <Header />
          <AppRoutes />
        </Container>
      </BrowserRouter>
    </AuthProvider >
  );
}

export default App;
