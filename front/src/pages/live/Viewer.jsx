import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { formatDuration } from "../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faEye, faPlus, faSync, faSyncAlt, faCheck as fasCheck, faCircle as fasCircle, faDesktop as fasDesktop, faMicrophone as fasMicrophone, faPlay as fasPlay, faQuestion as fasQuestion, faShare as fasShare, faSquare as fasSquare, faTrash as fasTrash, faVideo as fasVideo } from "@fortawesome/free-solid-svg-icons";
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

  const localUser = useRef(null);
  const [viewer, setViewer] = useState({ username: "Anonyme-" + Math.random().toString(36).substring(2) });
  const socketRef = useRef();
  const pcsRef = useRef({});
  const videoRef = useRef(null);
  const streamRef = useRef();

  useEffect(() => {
    API.get(`/users/live/${username}`)
      .then((response) => {
        const currentLive = response.data?.user?.live;

        if (user)
          setViewer({ username: user.username })

        if (currentLive) {
          const elapsedTime = formatDuration(dayjs(dayjs()).diff(currentLive.start_time, "seconds"));
          setLive({ ...currentLive, elapsedTime, username: response.data.user.username });
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
        console.log('ice connection state change', e);
      };

      pc.ontrack = (e) => {
        console.log('ontrack', e);
        if (!videoRef.current) return;
        videoRef.current.srcObject = e.streams[0];
      }

      if (!streamRef.current) console.log("no stream");
      else {
        streamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current);
        });
      }

      return pc;
    }, []);

  useEffect(() => {
    socketRef.current = io.connect(
      "ws://localhost:3000",
      {
        query: {
          token: token ?? null
        }
      }
    );

    getLocalStream();

    socketRef.current.on('room:users', ({ roomUsers }) => {
      setUsers(roomUsers);
    });

    socketRef.current.on(
      'offer:get',
      async ({
        sdp,
        offerSendId,
        offerSendUsername,
      }) => {
        console.log('get offer');
        if (!streamRef.current) return;
        const pc = createPeerConnection(offerSendId, offerSendUsername);
        if (!(pc && socketRef.current)) return;
        pcsRef.current = { ...pcsRef.current, [offerSendId]: pc };
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log('answer set remote description success');
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
        console.log('get answer');
        const pc = pcsRef.current[answerSendId];
        if (!pc) return;
        pc.setRemoteDescription(new RTCSessionDescription(sdp));
      },
    );

    socketRef.current.on(
      'candidate:get',
      async ({ candidate, candidateSendId }) => {
        console.log('get candidate');
        const pc = pcsRef.current[candidateSendId];
        console.log(candidateSendId, pcsRef.current)
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('candidate add success');
      },
    );

    socketRef.current.on(
      'users:exit',
      ({ id }) => {
        if (!pcsRef.current[id]) return;
        pcsRef.current[id].close();
        delete pcsRef.current[id];
        setUsers((oldUsers) => oldUsers.filter((user) => user.id !== id));
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




  return (
    <div>
      <div
        className="mt-6"
      >
        <div
          className="2xl:flex-row flex-col flex gap-12"
        >
          <div className="flex flex-col 2xl:w-1/2 gap-6">
            <>
              <h3
                className="font-semibold text-white"
              >Titre</h3>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Mon live trop cool"
                value={""}
                onChange={(e) => setTitle(e.target.value)}

                className="block text-lg font-semibold w-full px-4 py-2 rounded-lg bg-slate-800 text-gray-300 border-gray-600 focus:ring-blue-300 focus:ring-opacity-40 focus:border-blue-300 focus:outline-none focus:ring"
              />
            </>
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
          <div className="flex flex-col gap-5">
            <div className="flex flex-col bg-slate-800 rounded-xl 2xl:-mx-4 mt-4 py-4 px-4 gap-6">
              <h3 className="font-semibold text-white">Actions</h3>
              <div
                className="gap-x-5 flex self-center"
              >


              </div>
            </div>
            <div className="flex flex-col basis-full gap-5">
              <h3
                className="font-semibold text-white"
              >Sources</h3>

            </div>
          </div>

        </div>
      </div>

    </div >
  );
}

export default Viewer;
