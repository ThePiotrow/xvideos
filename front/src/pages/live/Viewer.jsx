import React, { useState, useEffect, useRef } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { formatDuration } from "../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faPlus,
  faSync,
  faSyncAlt,
  faCheck as fasCheck,
  faCircle as fasCircle,
  faDesktop as fasDesktop,
  faMicrophone as fasMicrophone,
  faPlay as fasPlay,
  faQuestion as fasQuestion,
  faShare as fasShare,
  faSquare as fasSquare,
  faTrash as fasTrash,
  faVideo as fasVideo,
} from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  query: {
    token: localStorage.getItem("token") ?? null,
  },
});

function Viewer() {
  const { username } = useParams();
  const [live, setLive] = useState({ elapsedTime: formatDuration(0) });
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    API.get(`/users/live/${username}`)
      .then((res) => {
        if (res.data) {
          if (!res.data?.user?.live?.id) {
            toast.error(
              <>
                <b>{username}</b> n'est pas en live
              </>
            );
            return;
          }
          setLive(res.data?.user?.live);

          console.log(socket);

          socket.emit("live.viewer.connect", { streamer: username }, (data) => {
            console.log(data);
          });

          socket.on("live.viewer.connect", (data) => {
            console.log(data);
          });

          socket.on("connect", () => {
            console.log("Connected to the server");
          });
          socket.on("disconnect", (reason) => {
            console.log("Disconnected from the server:", reason);
          });
          socket.on("connect_error", (error) => {
            console.error("Connect error:", error);
          });

          socket.on("live.stream", ({ stream }) => {
            console.log(stream);
            //const blob = new Blob([stream], { type: "video/webm" });  // Convert ArrayBuffer to Blob
            //const url = URL.createObjectURL(blob);  // Convert Blob to Object URL
            //videoRef.current.src = url;  // Set Object URL as the `src` of the video element

            if (videoRef.current) {
              videoRef.current.srcObject = stream; // Affectez le flux directement
            }
          });
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });

    return () => {};
  }, []);

  useEffect(() => {
    if (!live.start_time) return;
    const intervalId = setInterval(() => {
      setLive((prevLive) => ({
        ...prevLive,
        elapsedTime: formatDuration(
          dayjs(dayjs()).diff(prevLive.start_time, "seconds")
        ),
      }));
    }, 500);

    return () => clearInterval(intervalId);
  }, [live]);

  return (
    <div>
      <div className="self-center 2xl:self-start relative rounded-xl overflow-hidden aspect-video w-full h-fit">
        <video
          ref={videoRef}
          autoPlay={true}
          playsInline={true}
          className="aspect-video w-full bg-black"
        ></video>
        <p className="absolute bottom-3 right-4 text-sm backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-lg flex gap-2 items-center">
          <span
            className={`absolute h-2 w-2 rounded-full ${
              live?.id ? "bg-red-500 animate-ping" : ""
            }`}
          ></span>
          <span
            className={`relative h-2 w-2 rounded-full ${
              live?.id ? "bg-red-500" : "bg-slate-500"
            }`}
          ></span>
          {live.elapsedTime}
        </p>
      </div>
    </div>
  );
}

export default Viewer;
