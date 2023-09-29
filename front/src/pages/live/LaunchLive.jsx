import React, { useState, useEffect, useRef } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { formatDuration } from "../../utils/mediaUtils";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faPlus, faSync, faSyncAlt, faCheck as fasCheck, faCircle as fasCircle, faDesktop as fasDesktop, faMicrophone as fasMicrophone, faPlay as fasPlay, faQuestion as fasQuestion, faShare as fasShare, faSquare as fasSquare, faTrash as fasTrash, faVideo as fasVideo } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import "../../components/css/pulse.css"

const SEGMENT_TIME = 10000; // 10 seconds in milliseconds

function LaunchLive() {
  const [live, setLive] = useState({ elapsedTime: formatDuration(0) });
  const [title, setTitle] = useState("");
  const [mediaStream, setMediaStream] = useState(null);
  const [devices, setDevices] = useState({ video: [], audio: [] });
  const [storedVideoDevices, setStoredVideoDevices] = useState([]);
  const [storedAudioDevices, setStoredAudioDevices] = useState([]);
  const [recorder, setRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [segmentTimer, setSegmentTimer] = useState(null);

  const chunksRef = useRef(chunks);

  useEffect(() => {
    API.get("/users/me")
      .then((response) => {
        const currentLive = response.data.user?.live;
        console.log("currentLive", currentLive, response)
        if (currentLive) {
          const elapsedTime = formatDuration(dayjs(dayjs()).diff(currentLive.start_time, "seconds"));
          setLive({ ...currentLive, elapsedTime });

          console.log("currentLive", currentLive)

          if (currentLive.title) {
            setTitle(currentLive.title);
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du live ou de l'utilisateur", error);
      });
  }, []);

  useEffect(() => {
    if (!live.start_time) return
    const intervalId = setInterval(() => {
      setLive(prevLive => ({
        ...prevLive,
        elapsedTime: formatDuration(dayjs(dayjs()).diff(prevLive.start_time, "seconds"))
      }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [live]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(deviceList => {
        const video = deviceList
          .filter(device => device.kind === 'videoinput')
          .map(({ deviceId, kind, label, groupId }) => ({
            deviceId,
            kind,
            label,
            groupId,
            loading: false
          }));

        const audio = deviceList
          .filter(device => device.kind === 'audioinput')
          .map(({ deviceId, kind, label, groupId }) => ({
            deviceId,
            kind,
            label,
            groupId,
            loading: false
          }));

        setDevices({ video, audio });
      });
  }, []);

  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  useEffect(() => {
    let timer;
    if (recorder) {
      recorder.ondataavailable = (event) => {
        setChunks(prevChunks => {
          const newChunks = [...prevChunks, event.data];
          console.log("newChunks", newChunks)
          return newChunks;
        });
      };

      timer = setInterval(async () => {

        if (recorder.state === "inactive") return;

        const blob = new Blob(chunksRef.current, { type: "video/webm" });

        if (blob.size > 0) {
          console.log(blob);
          await sendToBackend(blob);
        }
      }, SEGMENT_TIME);

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        console.log(blob);
        await sendToBackend(blob); // Envoyer le blob final au backend si vous en avez besoin
      };

      setSegmentTimer(timer)
    }

    return () => {
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
      }
      clearInterval(segmentTimer);
    }
  }, [recorder]);

  const handleError = (errorMessage) => (err) => {
    toast.error(errorMessage);
    console.error("Erreur :", err);
  };

  const handleVideoStream = (stream, deviceId, kind, name) => {

    if (!storedVideoDevices.find(d => d.deviceId === deviceId)) {
      const device = devices.video.find(d => d.deviceId === deviceId);
      setStoredVideoDevices(prev => [...prev, {
        deviceId, stream, kind: (kind ?? (device?.label?.includes("screen") ? "screen" : "videoinput")), label: name || device.label
      }]);
    }

    if (kind === "screen") {
      stream.getVideoTracks()[0].onended = () => {
        // Remove the device when the screen sharing ends
        handleStopUsingStream(deviceId, kind);
      };
    }

    setLoader(deviceId, false);

  };

  const handleAudioStream = (stream, deviceId, kind, name) => {
    if (!storedAudioDevices.find(d => d.deviceId === deviceId)) {
      const device = devices.audio.find(d => d.deviceId === deviceId);
      console.log("device", device)
      setStoredAudioDevices(prev => [...prev, { deviceId, stream, kind: "audioinput", label: device.label }]);
    }

  };

  const handleRenameSource = (deviceId, name) => {
    setStoredVideoDevices(prev => prev.map(stream =>
      stream.deviceId === deviceId ? { ...stream, name } : stream
    ));
  };

  const switchToStream = (deviceId, type) => {
    if (type === 'audio') { }

    if (type === 'video') { }
    const stream = storedVideoDevices.find(s => s.deviceId === deviceId);
    if (stream) {
      setMediaStream(stream.stream);
      setSelectedVideo(stream);
      const videoElement = document.getElementById("video");
      videoElement.srcObject = stream.stream;
      // toast.success(`${stream.name || devices.video.find(stream => stream.deviceId === deviceId)?.label} affiché(e)`);
    }
  };

  const handleSourceChange = (deviceId, kind) => {

    if (kind === 'audio') {
      navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId } })
        .then(stream => {
          console.log("stream", stream)
          handleAudioStream(stream, deviceId, "audioinput", devices.audio.find(d => d.deviceId === deviceId).label);
          toast.success(`${devices.audio.find(d => d.deviceId === deviceId).label} stocké(e)`);
        })
        .catch(handleError("Failed to get user media"));
    } else {
      if (deviceId === 'screen') {
        navigator.mediaDevices.getDisplayMedia({ video: true })
          .then(stream => {
            handleVideoStream(stream, deviceId, "screen");
            toast.success(`${devices.video.find(d => d.deviceId === deviceId).label} stocké(e)`);
            const videoPreview = document.getElementById(`preview-${deviceId}`);
            if (videoPreview) {
              videoPreview.srcObject = mediaStream;
            }
          })
          .catch(handleError("Erreur lors de la capture d'écran"));
      } else {
        navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId }, audio: true })
          .then(stream => {
            handleVideoStream(stream, deviceId, "videoinput");
            toast.success(`${devices.video.find(d => d.deviceId === deviceId).label} stocké(e)`);
            const videoPreview = document.getElementById(`preview-${deviceId}`);
            if (videoPreview) {
              videoPreview.srcObject = mediaStream;
            }
          })
          .catch(handleError("Failed to get user media"));
      }
    }
  };

  // update devices and storedDevices when a device is removed
  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', () => {
      navigator.mediaDevices.enumerateDevices()
        .then(deviceList => {
          const video = deviceList
            .filter(device => device.kind === 'videoinput')
            .map(({ deviceId, kind, label, groupId }) => ({
              deviceId,
              kind,
              label,
              groupId,
              loading: false
            }));

          const audio = deviceList
            .filter(device => device.kind === 'audioinput')
            .map(({ deviceId, kind, label, groupId }) => ({
              deviceId,
              kind,
              label,
              groupId,
              loading: false
            }));

          setDevices({ video, audio });
          setStoredVideoDevices(prev => prev.filter(stream => video.some(device => device.deviceId === stream.deviceId)));

          setStoredAudioDevices(prev => prev.filter(stream => audio.some(device => device.deviceId === stream.deviceId)));
        });
    });
  }, []);

  const handleStopUsingStream = (deviceId, kind) => {
    console.log("handleStopUsingStream", deviceId, kind)
    console.log("device", deviceId, mergeDevicesArray(devices.video, storedVideoDevices))
    const device = mergeDevicesArray(devices, storedVideoDevices).find(stream => stream.deviceId === deviceId);
    toast.success(`${device?.label || device?.name || device.deviceId} supprimé(e)`);
    setStoredVideoDevices(prev => prev.filter(stream => stream.deviceId !== deviceId));
    const streamToStop = storedVideoDevices.find(stream => stream.deviceId === deviceId);
    console.log("streamToStop", streamToStop)
    if (streamToStop) {
      streamToStop.stream.getTracks().forEach(track => track.stop());
      if (kind === "screen")
        setDevices(prevDevices => ({
          video: prevDevices.video.filter(device => device.deviceId !== deviceId),
          audio: prevDevices.audio
        }));
    }
  };

  const handleAddScreenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then(stream => {
        console.log("stream", stream)
        const deviceId = 'screen-' + Date.now(); // Génère un ID unique pour chaque partage d'écran
        handleVideoStream(stream, deviceId, "screen", "Partage d'écran");

        // Ajout du nouveau partage d'écran à la liste des devices
        const newDevice = { deviceId, label: "Partage d'écran", kind: "screen", loading: false };
        setDevices(prevDevices => ({
          video: [...prevDevices.video, newDevice],
          audio: prevDevices.audio
        }));

        toast.success(`Partage d'écran stocké`);
      })
      .catch(handleError("Erreur lors de la capture d'écran"));
  };

  const handleSubmit = async () => {
    if (!mediaStream) {
      toast.error("Aucune source sélectionnée");
      return;
    }

    if (!title) {
      toast.error("Veuillez entrer un titre");
      return;
    }
    API.post("/lives", {
      title: title,
    })
      .then((response) => {
        toast.success("Live créé !");
        setLive(response.data.live);
        handleLiveStart();
      })
      .catch(handleError("un problème est survenu lors du lancement du live !"));
  };

  const handleLiveStart = () => {
    if (!mediaStream) {
      toast.error("Aucune source sélectionnée");
      return;
    }

    if (!title) {
      toast.error("Veuillez entrer un titre");
      return;
    }
    const localRecorder = new MediaRecorder(mediaStream);
    setRecorder(localRecorder);
    setChunks([]);
    localRecorder.start(SEGMENT_TIME);

  };

  const sendToBackend = async (blob) => {
    const formData = new FormData();
    formData.append("segment", blob);
    try {
      await API.post(`/lives/stream/${live.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      toast.success("Segment envoyé avec succès!");
      setChunks([]);
    } catch (err) {
      console.error("Erreur lors de l'envoi du segment:", err);
      toast.error("Erreur lors de l'envoi du segment.");
    }
  }

  const handleStop = () => {
    if (!live.id) return
    API.post(`/lives/${live.id}/stop`)
      .then((response) => {
        console.log("response", response)
        toast.success("Live arrêté !");
        setLive({
          id: null,
          title: null,
          start_time: null,
          end_time: null,
          elapsedTime: formatDuration(0)
        });
      })
      .catch((error) => {
        console.error("Erreur lors de l'arrêt du live", error);
        handleError("Erreur lors de l'arrêt du live !")
      });

    if (recorder && recorder.state === "recording") {
      recorder.stop();
      toast.success("Live arrêté !");
      // window.location.reload();  
    }
  };

  const handeStoreSource = (deviceId, kind) => {
    setLoader(deviceId, true);
    handleSourceChange(deviceId, kind)
  }

  const setLoader = (deviceId, loading) => {
    setDevices(prevDevices => ({
      video: prevDevices.video.map(device => device.deviceId === deviceId ? { ...device, loading } : device),
      audio: prevDevices.audio.map(device => device.deviceId === deviceId ? { ...device, loading } : device)
    }));
  }

  function mergeDevicesArray(arr1 = [], arr2 = []) {
    const map = {};
    console.log(arr1);

    [...arr1, ...arr2].forEach(device => {
      const isStored = storedVideoDevices.some(stream => stream.deviceId === device.deviceId);
      const isSelected = selectedVideo?.deviceId === device.deviceId;
      const isAddable = !(isStored || isSelected);

      map[device.deviceId] = {
        ...device,
        label: device?.name || device?.label || device?.deviceId,
        isStored,
        isSelected,
        isAddable
      };
    });

    return Object.values(map);
  }

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
                value={title}
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
                <video id="video" autoPlay={true}
                  className="aspect-video w-full bg-black"
                >
                </video>
                <p
                  className="absolute bottom-3 right-4 text-sm backdrop-blur-xl bg-slate-800/50 px-3 py-1 rounded-lg flex gap-2 items-center"
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
            <div className="flex flex-col bg-slate-800 rounded-xl -mt-4 -mx-4 py-4 px-4 gap-6">
              <h3 className="font-semibold text-white">Actions</h3>
              <div
                className="gap-x-5 flex self-center"
              >
                {live?.id &&
                  (<button
                    type="button"
                    onClick={handleLiveStart}
                    disabled={segmentTimer || !title || !mediaStream}
                    className="w-full flex gap-2 items-center px-5 py-3 disabled:bg-green-700/30 disabled:text-white/30 disabled:cursor-not-allowed border-none focus:border-none outline-none focus:outline-none leading-5 text-white transition-colors duration-300 transform bg-green-700 rounded-lg hover:bg-green-600 focus:bg-green-600"
                  >
                    <FontAwesomeIcon className="text-xs" icon={fasPlay} />
                    Reprendre
                  </button>
                  )
                }
                {!live?.id && (
                  <button type="button"
                    onClick={handleSubmit}
                    disabled={!title || !mediaStream}
                    className="w-full flex gap-2 items-center px-5 py-3 disabled:bg-green-700/30 disabled:text-white/30 disabled:cursor-not-allowed border-none focus:border-none outline-none focus:outline-none leading-5 text-white transition-colors duration-300 transform bg-green-700 rounded-lg hover:bg-green-600 focus:bg-green-600"
                  >
                    <FontAwesomeIcon className="text-xs" icon={fasPlay} />
                    Lancer
                  </button>
                )}

                <button type="button" onClick={handleStop}
                  disabled={!live?.id}
                  className="w-full flex gap-2 items-center px-5 py-3 disabled:bg-red-700/30 disabled:text-white/30 disabled:cursor-not-allowed border-none focus:border-none outline-none focus:outline-none leading-5 text-white transition-colors duration-300 transform bg-red-700 rounded-lg hover:bg-red-600 focus:bg-red-600"
                >
                  <FontAwesomeIcon className="text-xs" icon={fasSquare} />
                  Arrêter</button>


              </div>
            </div>
            <div className="flex flex-col basis-full gap-5">
              <h3
                className="font-semibold text-white"
              >Sources</h3>
              <ul
                className="text-sm font-medium w-full grid md:grid-cols-2 gap-5"
              >
                {mergeDevicesArray(devices.video, storedVideoDevices).map(device => {
                  return (
                    <li
                      className={`rounded-lg `}
                      key={device.deviceId}
                    >

                      <button
                        disabled={device.loading}
                        type="button"
                        title={device.label}
                        className={`border-none w-full focus:border-none focus:ring-none focus:outline-none m-0 p-0 transition-transform duration-500
                             hover:scale-[1.03]`}
                        onClick={(e) => {
                          if (device.isAddable)
                            handeStoreSource(device.deviceId, 'video')
                          if (device.isStored && !device.isSelected)
                            switchToStream(device.deviceId)
                        }}
                      >

                        <div
                          className={`flex flex-col z-30 justify-between gap-6 w-full h-full relative min-h-[250px] max-w-full py-3 px-4 text-left text-sm font-medium text-gray-300 transition-colors duration-300 ${device.isSelected ? "bg-red-700" : device.isStored ? "bg-green-800" : "bg-slate-800"} rounded-xl`}
                        >
                          <span
                            id={`btn-${device.deviceId}`}
                            className={`absolute z-20 top-0 right-0 bottom-0 left-0 rounded-xl ${device.isSelected ? "bg-red-700 animate-pulsar" : ''}`}
                          >
                          </span>

                          <div className="z-30 self-end">

                            {device.loading && (
                              <FontAwesomeIcon className="z-30 text-lg self-start animate-spin" icon={faCircleNotch} />
                            )}
                            {!device.loading && !device.isStored && !device.isSelected && (
                              <FontAwesomeIcon className="z-30 text-lg self-start" icon={faCircle} />
                            )}
                            {!device.loading && device.isStored && !device.isSelected && (
                              <FontAwesomeIcon className="z-30 text-lg self-start" icon={fasCheck} />
                            )}
                            {!device.loading && device.isSelected && (
                              <FontAwesomeIcon className="z-30 text-lg self-start" icon={fasCircle} />
                            )}
                          </div>

                          <div className="flex flex-col justify-center items-center z-30 gap-6">
                            <FontAwesomeIcon className="z-30 text-4xl" icon={device.kind === "videoinput" ? fasVideo : device.kind === "screen" ? fasDesktop : fasQuestion} />
                            <span className="text-lg text-center">{device.label}</span>
                          </div>

                          <span className={`
                          self-end text-sm z-30 relative px-3 py-1 shadow-sm rounded-full transition-colors duration-300
                          ${!device.isStored && !device.isSelected ?
                              "bg-slate-700" :
                              device.isStored && !device.isSelected ?
                                "bg-green-700" :
                                "bg-red-600"}
                                `}>
                            {!device.isStored && !device.isSelected && ("Ajouter")}
                            {device.isStored && !device.isSelected && ("Disponible")}
                            {device.isSelected && ("En cours d'utilisation")}
                          </span>


                        </div>

                      </button>
                      {/* <button
                            type="button"
                            disabled={!device.isStored}
                            onClick={() => handleStopUsingStream(device.deviceId, 'video')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${device.isStored ? "bg-red-500" : "bg-slate-500"}`}
                          >
                            <FontAwesomeIcon icon={faSquare} />
                          </button> */}
                    </li>
                  )
                })}
                <li className=" ">
                  <button onClick={handleAddScreenShare} type="button"
                    className="border-none w-full focus:border-none focus:ring-none focus:outline-none m-0 p-0 transition-transform duration-500
                        hover:scale-[1.03]"
                  >

                    <div className="flex flex-col justify-center items-center gap-4 max-w-full py-3 px-4 text-left text-sm font-medium text-gray-300 bg-slate-800 rounded-xl min-h-[250px]">
                      <FontAwesomeIcon className="text-lg" icon={faPlus} />
                      <span className="text-lg">Ajouter un écran</span>
                    </div>

                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

    </div >
  );
}

export default LaunchLive;
