import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { formatDuration } from "../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faEye,
  faPaperPlane,
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
import "../../components/css/pulse.css";

import { io } from "socket.io-client";
import { useAuth } from "../../contexts/authContext";
import Video from "../../components/Video";
import { useNavigate } from "react-router-dom";

const pc_config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function Streamer() {
  const { user, token } = useAuth();

  const [live, setLive] = useState({ elapsedTime: formatDuration(0) });
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [devices, setDevices] = useState({ audio: [], video: [] });
  const [storedDevices, setStoredDevices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const localUser = useRef(null);
  const socketRef = useRef();
  const pcsRef = useRef({});
  const videoRef = useRef(null);
  const streamRef = useRef();
  const chat = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    API.get("/users/me")
      .then((response) => {
        const currentLive = response.data?.user?.live;
        localUser.current = response.data?.user;

        if (currentLive?.start_time) {
          const elapsedTime = formatDuration(
            dayjs(dayjs()).diff(currentLive.start_time, "seconds")
          );
          setLive({
            ...currentLive,
            elapsedTime,
            username: response.data.user.username,
          });
          getLocalStream();
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du live", error);
        toast.error("Erreur lors de la récupération du live !");
      });
  }, [user]);

  useEffect(() => {
    if (!live.start_time) return;
    const intervalId = setInterval(() => {
      setLive((prevLive) => ({
        ...prevLive,
        elapsedTime: formatDuration(
          dayjs(dayjs()).diff(prevLive.start_time, "milliseconds") / 1000
        ),
      }));
    }, 800);

    return () => clearInterval(intervalId);
  }, [live]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      const video = deviceList
        .filter((device) => device.kind === "videoinput")
        .map(({ deviceId, kind, label, groupId }) => ({
          deviceId,
          kind,
          label,
          groupId,
          loading: false,
        }));

      const audio = deviceList
        .filter((device) => device.kind === "audioinput")
        .map(({ deviceId, kind, label, groupId }) => ({
          deviceId,
          kind,
          label,
          groupId,
          loading: false,
        }));

      setDevices({ video, audio });
    });
  }, []);

  const handleLiveStart = () => {
    API.post("/lives", { title })
      .then((response) => {
        const currentLive = response.data?.live;
        const elapsedTime = formatDuration(
          dayjs(dayjs()).diff(currentLive.start_time, "seconds")
        );
        setLive({ ...currentLive, elapsedTime });
      })
      .catch((error) => {
        console.error("Erreur lors du lancement du live", error);
        toast.error("Erreur lors du lancement du live !");
      });
  };

  const handleStop = () => {
    if (!live.id) return;
    socketRef.current.emit("live:stop", {
      room: localUser.current.username,
      live_id: live.id,
    });
  };

  const getLocalStream = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = localStream;
      videoRef.current.srcObject = localStream;
      if (!socketRef.current) return;
      socketRef.current.emit("room:join", {
        room: localUser.current.username,
        username: localUser.current.username,
      });
    } catch (e) {
      console.error(`getUserMedia error: ${e}`);
    }
  }, []);

  const createPeerConnection = useCallback((id, username) => {
    const pc = new RTCPeerConnection(pc_config);

    pc.onicecandidate = (e) => {
      if (socketRef.current.id == id) return;
      if (!(socketRef.current && e.candidate)) return;
      socketRef.current.emit("candidate:make", {
        candidate: e.candidate,
        candidateSendId: socketRef.current.id,
        candidateReceiveId: id,
      });
    };

    pc.oniceconnectionstatechange = (e) => { };

    pc.ontrack = (e) => {
      setUsers((oldUsers) =>
        oldUsers
          .filter((user) => user.id !== id)
          .concat({
            id,
            username,
            stream: e.streams[0],
          })
      );
    };

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });
    }

    return pc;
  }, []);

  useEffect(() => {
    socketRef.current = io.connect(`wss://${process.env.VITE_BASE_URI}:${process.env.VITE_API_GATEWAY_PORT}`, {
      query: {
        token: token ?? null,
      },
    });

    socketRef.current.on("room:users", async ({ users, _user }) => {
      setUsers(users);
      if (!streamRef.current && _user.id === socketRef.current.id) return;
      const pc = createPeerConnection(_user.id, _user.username);
      if (!(pc && socketRef.current)) return;
      pcsRef.current = { ...pcsRef.current, [_user.id]: pc };
      try {
        const localSdp = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(new RTCSessionDescription(localSdp));
        socketRef.current.emit("offer:make", {
          sdp: localSdp,
          offerSendId: socketRef.current.id,
          offerSendUsername: localUser.current.username,
          offerReceiveId: _user.id,
        });
      } catch (e) {
        console.error(e);
      }
    });

    socketRef.current.on(
      "offer:get",
      async ({ sdp, offerSendId, offerSendUsername }) => {
        if (!streamRef.current) return;
        const pc = createPeerConnection(offerSendId, offerSendUsername);
        if (!(pc && socketRef.current)) return;
        pcsRef.current = { ...pcsRef.current, [offerSendId]: pc };
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const localSdp = await pc.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
          await pc.setLocalDescription(new RTCSessionDescription(localSdp));
          socketRef.current.emit("answer:make", {
            sdp: localSdp,
            answerSendId: socketRef.current.id,
            answerReceiveId: offerSendId,
          });
        } catch (e) {
          console.error(e);
        }
      }
    );

    socketRef.current.on("answer:get", async ({ sdp, answerSendId }) => {
      const pc = pcsRef.current[answerSendId];
      if (!pc) return;
      pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketRef.current.on(
      "candidate:get",
      async ({ candidate, candidateSendId }) => {
        const pc = pcsRef.current[candidateSendId];
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    );

    socketRef.current.on("users:exit", ({ client, users }) => {
      setUsers(users);
      if (!pcsRef.current[client]) return;
      pcsRef.current[client].close();
      delete pcsRef.current[client];
    });

    socketRef.current.on(
      "message:receive",
      ({ message, username, timestamp }) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { message, username, timestamp },
        ]);
      }
    );

    socketRef.current.on("live:stop", ({ live, room }) => {
      setLive({ ...live, elapsedTime: formatDuration(0) });
      socketRef.current.disconnect();
      if (!pcsRef.current) return;
      Object.keys(pcsRef.current).forEach((key) => {
        pcsRef.current[key].close();
        delete pcsRef.current[key];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      users.forEach((user) => {
        if (!pcsRef.current[user.id]) return;
        pcsRef.current[user.id].close();
        delete pcsRef.current[user.id];
      });
    };
  }, [createPeerConnection, getLocalStream]);

  const handleMessageSend = () => {
    if (!user) return;
    if (!(message && message.length)) return;

    socketRef.current.emit("message:send", {
      room: live.username,
      message,
    });
    setMessage("");
  };

  useEffect(() => {
    chat.current.scrollTop = chat.current.scrollHeight;
  }, [messages]);

  return (
    <div>
      <div className="mt-6">
        <div className="2xl:flex-row flex-col flex gap-12">
          <div className="flex flex-col 2xl:w-1/2 gap-6">
            <>
              <h3 className="font-semibold text-white">Titre</h3>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Mon live trop cool"
                value={live.title}
                onChange={(e) => setTitle(e.target.value)}
                className="block text-lg font-semibold w-full px-4 py-2 rounded-lg bg-slate-800 text-gray-300 border-gray-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
              />
            </>
            <div className="flex gap-5">
              <div className="self-center 2xl:self-start relative rounded-xl overflow-hidden aspect-video w-full h-fit">
                <video
                  id="video"
                  ref={videoRef}
                  autoPlay={true}
                  className="aspect-video w-full bg-black"
                ></video>
                <div className="absolute bottom-3 right-4 text-sm flex gap-2 items-center">
                  <p className="backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-lg flex gap-2 items-center">
                    <FontAwesomeIcon className="text-xs" icon={faEye} />
                    {users.length ?? 0}
                  </p>
                  <p className="backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-lg flex gap-2 items-center">
                    <span
                      className={`absolute h-2 w-2 rounded-full ${live?.id ? "bg-red-500 animate-ping" : ""
                        }`}
                    ></span>
                    <span
                      className={`relative h-2 w-2 rounded-full ${live?.id ? "bg-red-500" : "bg-slate-500"
                        }`}
                    ></span>
                    {live.elapsedTime}
                  </p>
                </div>
              </div>

              {/* <div className=" max-w-[300px]">
                  <h3
                    className="mb-4 font-semibold text-white"
                  >Périphériques audio</h3>
                  <ul
                    className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-xl dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                  >
                    {devices.audio.map(device => (
                      <li
                        className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600"
                        key={device.deviceId}>
                        <div
                          className="flex items-center pl-3"
                        >
                          <input type="checkbox"
                            checked={storedAudioDevices.find(stream => stream.deviceId === device.deviceId)}
                            disabled={storedAudioDevices.find(stream => stream.deviceId === device.deviceId)}
                            onClick={() => handeStoreSource(device.deviceId, 'audio')}
                            name="audio" id={`pre-${device.deviceId}`}
                            className="w-6 h-6 text-blue-600 bg-slate-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-1"
                          />
                          <label htmlFor={`pre-${device.deviceId}`}
                            className="w-full py-3 ml-2 text-sm font-medium text-gray-300"
                          >{device.label}</label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div> */}
            </div>
          </div>

          <div className="min-w-[400px] bg-slate-800 rounded-xl flex flex-col">
            <div className="flex basis-14 rounded-t-xl items-center px-4 border-b border-slate-600">
              <h2 className="font-semibold">Chat</h2>
            </div>
            <div
              ref={chat}
              className="flex flex-col basis-full max-h-[500px] overflow-y-scroll gap-4 p-3"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="flex flex-col w-full px-4 pt-2 pb-3 bg-slate-300/20 gap-2 rounded-lg shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">@{message.username}</p>
                    <p className="text-xs text-gray-400">
                      {dayjs(message.timestamp).format("HH:mm")}
                    </p>
                  </div>
                  <p className="text-sm pl-2">{message.message}</p>
                </div>
              ))}
            </div>
            <div className="relative flex basis-20 rounded-b-xl w-full border-t border-slate-600">
              <textarea
                onKeyUpCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.key === "Enter" && !e.shiftKey) handleMessageSend();
                }}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                placeholder="Envoyer un message"
                type="text"
                cols={3}
                className="w-full rounded-none rounded-bl-xl text-sm outline-none py-2 px-3 resize-none bg-transparent"
              />
              <button
                className="rounded-none border-none rounded-br-xl aspect-square bg-slate-600 disabled:bg-slate-200/50 transition-colors duration-150 no-scrollbar"
                onClick={() => {
                  handleMessageSend();
                }}
                disabled={!message.length}
              >
                <FontAwesomeIcon
                  className={`${message.length ? "animate-pulse" : ""}`}
                  icon={faPaperPlane}
                />
              </button>
              {!user && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-slate-800/40 backdrop-blur-xl rounded-b-xl">
                  <p className="text-white text-center text-sm">
                    Connectez-vous pour pouvoir envoyer des messages
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col bg-slate-800 rounded-xl 2xl:-mx-4 mt-4 py-4 px-4 gap-6">
              <h3 className="font-semibold text-white">Actions</h3>
              <div className="gap-x-5 flex self-center">
                {!live?.id && (
                  <button
                    type="button"
                    onClick={handleLiveStart}
                    disabled={!title}
                    className="w-full flex gap-2 items-center px-5 py-3 disabled:bg-green-700/30 disabled:text-white/30 disabled:cursor-not-allowed border-none focus:border-none outline-none focus:outline-none leading-5 text-white transition-colors duration-300 transform bg-green-700 rounded-lg hover:bg-green-600 focus:bg-green-600"
                  >
                    <FontAwesomeIcon
                      className="text-sm pt-[2px]"
                      icon={fasPlay}
                    />
                    <span>Lancer</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleStop}
                  disabled={!live?.id}
                  className="w-full flex gap-2 items-center px-5 py-3 disabled:bg-red-700/30 disabled:text-white/30 disabled:cursor-not-allowed border-none focus:border-none outline-none focus:outline-none leading-5 text-white transition-colors duration-300 transform bg-red-700 rounded-lg hover:bg-red-600 focus:bg-red-600"
                >
                  <FontAwesomeIcon
                    className="text-sm pt-[2px]"
                    icon={fasSquare}
                  />
                  Arrêter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Streamer;
