import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { formatDuration } from "../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faEye, faPaperPlane, faPlus, faSync, faSyncAlt, faCheck as fasCheck, faCircle as fasCircle, faDesktop as fasDesktop, faMicrophone as fasMicrophone, faPlay as fasPlay, faQuestion as fasQuestion, faShare as fasShare, faSquare as fasSquare, faTrash as fasTrash, faVideo as fasVideo } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import "../../components/css/pulse.css"

import { io } from "socket.io-client";
import { useAuth } from "../../contexts/authContext";
import { useParams } from "react-router-dom";


const pc_config = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

function Viewer() {
  const { user, token } = useAuth();
  const { username } = useParams();

  const [live, setLive] = useState({ elapsedTime: formatDuration(0) });
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const localUser = useRef(null);
  const [viewer, setViewer] = useState({ username: "Anonyme-" + Math.random().toString(36).substring(2) });
  const socketRef = useRef();
  const pcRef = useRef({});
  const videoRef = useRef(null);
  const streamRef = useRef();
  const chat = useRef(null);

  useEffect(() => {
    API.get(`/users/live/${username}`)
      .then((response) => {
        const currentLive = response.data?.user?.live;

        if (user)
          setViewer({ username: user.username })

        if (currentLive?.start_time) {
          const elapsedTime = formatDuration(dayjs(dayjs()).diff(currentLive.start_time, "seconds"));
          setLive(
            {
              ...currentLive,
              elapsedTime,
              username: response.data.user.username
            });
        }

      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du live", error);
        toast.error("Erreur lors de la récupération du live !");
      });
  }, [user]);

  useEffect(() => {
    if (!live.start_time) return
    const intervalId = setInterval(() => {
      setLive(prevLive => ({
        ...prevLive,
        elapsedTime: formatDuration(dayjs(dayjs()).diff(prevLive.start_time, "milliseconds") / 1000)
      }));
    }, 800);
    return () => clearInterval(intervalId);
  }, [live]);


  const getLocalStream = useCallback(async () => {
    try {
      if (!socketRef.current) return;
      socketRef.current.emit('room:join', {
        room: username,
        username: viewer.username,
      });
    } catch (e) {
      console.error(`getUserMedia error: ${e}`);
    }
  }, []);


  const createPeerConnection = useCallback(
    (id, username) => {
      const pc = new RTCPeerConnection(pc_config);

      pc.onicecandidate = (e) => {
        if (!(socketRef.current && e.candidate)) return;
        socketRef.current.emit('candidate:make', {
          candidate: e.candidate,
          candidateSendId: socketRef.current.id,
          candidateReceiveId: id,
        });
      };

      pc.oniceconnectionstatechange = (e) => {
      };

      pc.ontrack = (e) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = e.streams[0];
      }

      return pc;
    }, []);

  useEffect(() => {
    socketRef.current = io.connect(
      "wss://13.38.18.223:3000",
      {
        query: {
          token: token ?? null
        }
      }
    );

    getLocalStream();

    socketRef.current.on('room:users', ({ users, messages }) => {
      setUsers(users);
      setMessages(messages);
    });

    socketRef.current.on(
      'offer:get',
      async ({
        sdp,
        offerSendId,
        offerSendUsername,
      }) => {
        const pc = createPeerConnection(offerSendId, offerSendUsername);
        if (!(pc && socketRef.current)) return;
        pcRef.current = { [offerSendId]: pc };
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const localSdp = await pc.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
          await pc.setLocalDescription(new RTCSessionDescription(localSdp));
          socketRef.current.emit('answer:make', {
            sdp: localSdp,
            answerSendId: socketRef.current.id,
            answerReceiveId: offerSendId,
          });
        } catch (e) {
          console.error(e);
        }
      },
    );

    socketRef.current.on(
      'answer:get',
      async ({ sdp, answerSendId }) => {
        const pc = pcRef.current[answerSendId];
        if (!pc) return;
        pc.setRemoteDescription(new RTCSessionDescription(sdp));
      },
    );

    socketRef.current.on(
      'candidate:get',
      async ({ candidate, candidateSendId }) => {
        const pc = pcRef.current[candidateSendId];
        console.log(candidateSendId, pcRef.current)
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      },
    );

    socketRef.current.on(
      'users:exit',
      ({ users, room }) => {
        setUsers(users);
        if (!pcRef.current[room]) return;
        pcRef.current[room].close();
        delete pcRef.current[room];
      });

    socketRef.current.on(
      'message:receive',
      ({ message, username, timestamp }) => {
        setMessages(prevMessages => [...prevMessages, { message, username, timestamp }]);
      });

    socketRef.current.on(
      'live:stop',
      ({ live, room }) => {
        setLive({ ...live, elapsedTime: formatDuration(0) });
        socketRef.current.disconnect();
        if (!pcRef.current) return;
        pcRef.current[room].close();
        delete pcRef.current[room];
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      users.forEach((user) => {
        if (!pcRef.current[user.id]) return;
        pcRef.current[user.id].close();
        delete pcRef.current[user.id];
      });
    };
  }, [createPeerConnection, getLocalStream]);

  const handleMessageSend = () => {
    if (!user) return;
    if (!(message && message.length)) return;

    socketRef.current.emit('message:send', {
      room: live.username,
      message,
    });
    setMessage("");
  }

  useEffect(() => {
    chat.current.scrollTop = chat.current.scrollHeight;
  }, [messages]);


  return (
    <div>
      <div
        className="mt-6"
      >
        <div
          className="2xl:flex-row flex-col flex gap-6"
        >
          <div className="flex flex-col w-full gap-6">
            <div
              className="flex gap-5"
            >
              <div
                className="self-center 2xl:self-start relative rounded-xl overflow-hidden aspect-video w-full h-fit"
              >
                <video
                  id="video"
                  ref={videoRef}
                  autoPlay={true}
                  className="aspect-video w-full bg-black"
                ></video>
                <div className="absolute top-3 left-4 right-4 flex gap-2 items-center justify-between">
                  <h3
                    className="block text-lg font-semibold px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-xl text-gray-300 border-gray-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
                  >
                    {live.title}
                  </h3>
                  <h3
                    className="block  font-semibold text-gray-300 border-gray-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
                  >
                    @{live.username}
                  </h3>
                </div>
                <div className="absolute bottom-3 right-4 text-sm flex gap-2 items-center">
                  <p
                    className="backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-lg flex gap-2 items-center"
                  >
                    <FontAwesomeIcon className="text-xs" icon={faEye} />
                    {users.length ?? 0}
                  </p>
                  <p
                    className="backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-lg flex gap-2 items-center"
                  >
                    <span
                      className={`absolute h-2 w-2 rounded-full ${live?.id ? "bg-red-500 animate-ping" : ''}`}
                    ></span>
                    <span
                      className={`relative h-2 w-2 rounded-full ${live?.id ? "bg-red-500" : 'bg-slate-500'}`}
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
            <div ref={chat} className="flex flex-col basis-full max-h-[500px] overflow-y-scroll gap-4 p-3">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col w-full px-4 pt-2 pb-3 bg-slate-300/20 gap-2 rounded-lg shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">@{message.username}</p>
                    <p className="text-xs text-gray-400">{dayjs(message.timestamp).format("HH:mm")}</p>
                  </div>
                  <p className="text-sm pl-2">{message.message}</p>
                </div>
              ))}
            </div>
            <div className="relative flex basis-20 rounded-b-xl w-full border-t border-slate-600">
              <textarea
                onKeyUpCapture={
                  (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.key === 'Enter' && !e.shiftKey)
                      handleMessageSend();
                  }
                }
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                placeholder="Envoyer un message"
                type="text" cols={3} className="w-full rounded-none rounded-bl-xl text-sm outline-none py-2 px-3 resize-none bg-transparent" />
              <button
                className="rounded-none border-none rounded-br-xl aspect-square bg-slate-600 disabled:bg-slate-200/50 transition-colors duration-150 no-scrollbar"
                onClick={() => {
                  handleMessageSend();
                }}
                disabled={!message.length}
              >
                <FontAwesomeIcon className={`${message.length ? 'animate-pulse' : ''}`} icon={faPaperPlane} />
              </button>
              {!user && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-slate-800/40 backdrop-blur-xl rounded-b-xl">
                  <p className="text-white text-center text-sm">Connectez-vous pour pouvoir envoyer des messages</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div >
  );
}

export default Viewer;
