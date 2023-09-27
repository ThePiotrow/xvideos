import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";

function LaunchLive() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [mediaStream, setMediaStream] = useState(null);
  const [recorder, setRecorder] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMediaStream(stream);
      })
      .catch(err => {
        toast.error("Failed to get user media");
        console.error("Error getting user media:", err);
      });

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mediaStream) {
      toast.error("Media not available");
      return;
    }

    API.post("/lives", {
      title: title,
    })
      .then((response) => {
        toast("Live lancé !");
        const localRecorder = new MediaRecorder(mediaStream);
        setRecorder(localRecorder);

        const chunks = [];

        localRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
          console.log(event.data);
        };

        localRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          console.log(blob);
        };

        localRecorder.start();

      })
      .catch((error) => {
        toast.error("un problème est survenu lors du lancement du live !");
      });
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
      <form onSubmit={handleSubmit}><div className="mt-6">
        <div className="flex justify-between mb-2">
          <label htmlFor="title" className="text-gray-700 dark:text-gray-200">Titre du live</label>
        </div>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Votre mot titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
        />
      </div>
        <div className="mt-6 gap-x-5 flex">
          <button className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">Lancer</button>

          <button type="button" onClick={handleStop} className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-red-700 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">Arrêter</button>
        </div>
      </form>
    </div>
  );
}

export default LaunchLive;
