import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";

function LaunchLive() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [mediaStream, setMediaStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [usingDevices, setUsingDevices] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(deviceList => {
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices([...videoDevices, { deviceId: 'screen', label: 'Partager l’écran' }]);
      });
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setCameraStream(stream);
      })
      .catch(handleError("Failed to get user media"));
  }, []);

  const handleStream = (stream, deviceId) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    setMediaStream(stream);
    const videoElement = document.getElementById("video");
    videoElement.srcObject = stream;
  };

  const handleSourceChange = (deviceId) => {
    if (deviceId === 'screen' || deviceId === 'window') {
      if (!screenStream) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
          .then(stream => {
            setScreenStream(stream);
            handleStream(stream, deviceId);
          })
          .catch(handleError("Erreur lors de la capture d'écran"));
      } else {
        handleStream(screenStream, deviceId);
      }
    } else {
      handleStream(cameraStream, deviceId);
    }
  };

  const stopUsingSource = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setMediaStream(null);
  };

  const handleError = (errorMessage) => (err) => {
    toast.error(errorMessage);
    console.error("Erreur :", err);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mediaStream) {
      toast.error("Media not available");
      return;
    }

    API.post("/lives", {
      title: title,
    })
      .then(handleLiveStart)
      .catch(handleError("un problème est survenu lors du lancement du live !"));
  };

  const handleLiveStart = () => {
    toast("Live lancé !");
    const localRecorder = new MediaRecorder(mediaStream);
    setRecorder(localRecorder);

    const chunks = [];

    localRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    localRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      console.log(blob);
    };

    localRecorder.start();
  };

  const handleStop = () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      setRecorder(null);
      toast("Live arrêté !");
    }
  };

  return (
    <div>
      <h2>Page de lancement d'un live</h2>
      <form onSubmit={handleSubmit}>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <label htmlFor="title" className="text-gray-700 dark:text-gray-200">Titre du live</label>
          </div>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Votre titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
        <div className="mt-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Sources</th>
                <th>Stocké</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <tr key={device.deviceId}>
                  <td>{device.label || `Caméra ${device.deviceId}`}</td>
                  <td>{/* Ici, vous pouvez afficher si le flux est stocké ou non */}</td>
                  <td>
                    {mediaStream && (cameraStream === device || screenStream === device) ? (
                      <button
                        type="button"
                        onClick={stopUsingSource}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                      >
                        Arrêter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSourceChange(device.deviceId)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md"
                      >
                        Utiliser
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 gap-x-5 flex">
          <button type="submit" className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">Lancer</button>
          <button type="button" onClick={handleStop} className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-red-700 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">Arrêter</button>
        </div>
      </form>
      <div className="relative rounded-xl overflow-hidden aspect-video w-fit h-fit">
        <video controls id="video" autoPlay={true} className="aspect-video w-[550px]"></video>
      </div>
    </div>
  );
}

export default LaunchLive;
