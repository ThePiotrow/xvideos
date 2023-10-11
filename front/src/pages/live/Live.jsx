//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { formatDuration } from "../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/authContext";

function Live() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lives, setLives] = useState([]);
  const [liveData, setLiveData] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLiveData((prevLives) =>
        prevLives.map((live) => ({
          ...live,
          elapsedTime: formatDuration(
            dayjs(dayjs()).diff(live.start_time, "seconds")
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    API.get("/lives")
      .then((response) => {
        const livesWithTime = response.data.lives.map((live) => ({
          ...live,
          elapsedTime: formatDuration(
            dayjs(dayjs()).diff(live.start_time, "seconds")
          ),
        }));
        setLiveData(livesWithTime);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des lives", error);
      });
  }, []);

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {liveData.map((live) => (
        <div
          className="cursor-pointer relative group w-full bg-slate-800 rounded-xl"
          key={live.id}
          onClick={() =>
            navigate(
              `/live${live.user.username === user?.username
                ? ""
                : `/${live.user.username}`
              }`
            )
          }
          title={live.title}
        >
          <div className="relative group-hover:scale-[1.02] duration-500 aspect-video w-full">
            <img
              className=" bg-slate-300 bg-center bg-cover rounded-xl transition-all aspect-video hover:duration-700 easy-in-out shadow-lg group-hover:shadow-xl object-cover"
              src={""}
              preload="metadata"
            />
            {live.start_time && (
              <p className="absolute bottom-3 right-4 text-sm backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-md flex gap-2 items-center">
                <span className="h-2 w-2 rounded-full bg-red-700"></span>
                {live.elapsedTime}
              </p>
            )}
          </div>
          <h3 className="mt-2 text-sm font-medium text-slate-200 truncate transition-all duration-500 ease-in-out px-3">
            {live.title}
          </h3>
          <div className="text-xs text-slate-400 flex px-3 py-2 items-center justify-between">
            <p>@{live.user.username}</p>
          </div>
        </div>
      ))}

      {!liveData.length && (
        <div className="flex flex-col items-center justify-center col-span-full mt-12">
          <p className="text-slate-200 text-lg font-medium mb-2">
            Aucun live en cours
          </p>
          <p className="text-slate-400 text-sm">Revenez plus tard !</p>
        </div>
      )}
    </div>
  );
}

export default Live;
