import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './css/video-player.module.css';

export const VideoJS = ({ hls, thumbnail, duration }) => {
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [qualityChangeToggle, setQualityChangeToggle] = useState(false);
  const [volume, setVolume] = useState(100);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState({ current: 0, total: duration });
  const [bufferProgress, setBufferProgress] = useState(0);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // If qualityChangeToggle is true, never hide controls
  useEffect(() => {
    if (qualityChangeToggle) {
      setIsControlsVisible(true);
    }
  }, [isControlsVisible]);

  const toggleControlsVisibility = useCallback((state) => {
    if (videoRef.current.paused || videoRef.current.ended) { setIsControlsVisible(true); return }

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setIsControlsVisible(state);

    if (state) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
        if (isFullscreen) {
          videoContainerRef.current.style.cursor = 'none';
        }
      }, 2500);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    const updateBufferProgress = () => {
      if (video.buffered.length > 0) {
        const bufferEnd = video.buffered.end(video.buffered.length - 1);
        const bufferValue = (bufferEnd / video.duration) * 100;
        setBufferProgress(bufferValue);
      }
    };

    video.addEventListener('progress', updateBufferProgress);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const interval = setInterval(() => {
      if (video) {
        setProgress(video.currentTime * 100 / video.duration);
        setTimer(
          {
            current: video.currentTime,
            total: video.duration
          }
        )
      }
    }, 50);

    return () => {
      clearInterval(interval);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      video.removeEventListener('progress', updateBufferProgress);
    };
  }, []);

  useEffect(() => {
    if (Hls.isSupported() && hls) {
      const hlsPlayer = new Hls();
      hlsPlayer.loadSource(hls);
      hlsPlayer.attachMedia(videoRef.current);

      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        setLevels(hlsPlayer.levels);
      });

      hlsPlayer.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
        setCurrentLevel(data.level);
      });

      hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsPlayer.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsPlayer.recoverMediaError();
              break;
            default:
              hlsPlayer.destroy();
              break;
          }
        }
      });
      videoRef.current.hls = hlsPlayer;


      toggleControlsVisibility(true);

      return () => {
        hlsPlayer.destroy();
        if (videoRef.current) {
          videoRef.current.hls = null;
        }

      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = hls;
    }
  }, [hls]);

  //On video end
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.onended = () => {
        setIsPlaying(false);
        toggleControlsVisibility(true);
      };
    }
  }, [videoRef]);


  const handleQualityChange = (e, levelIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.hls) {
      console.error("HLS player not available");
      return;
    }
    const hlsPlayer = videoRef.current.hls;
    try {
      hlsPlayer.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    } catch (error) {
      console.error("Error changing video quality: ", error);
      toast.error("Erreur lors du changement de qualité de la vidéo");
    }
    setQualityChangeToggle(false);
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation()
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const video = videoRef.current;
    const offsetX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth; // Change e.target to e.currentTarget
    const newVolume = (offsetX / width);
    video.volume = newVolume;
    setVolume(newVolume * 1.02 * 100);
  };

  const toggleFullscreen = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!document.fullscreenElement) {
        const requestFullscreen = videoContainerRef.current.requestFullscreen || videoContainerRef.current.webkitRequestFullscreen || videoContainerRef.current.mozRequestFullScreen || videoContainerRef.current.msRequestFullscreen;
        await requestFullscreen.call(videoContainerRef.current);
      } else {
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        await exitFullscreen.call(document);
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
    }
  };

  const toogleQualityChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQualityChangeToggle(!qualityChangeToggle);
  }

  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDrag = (e, next) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragging) {
      next(e);
    }
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleProgressClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const offsetX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth; // Change e.target to e.currentTarget
    const newTime = (offsetX / width) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
  };

  return (
    <div
      ref={videoContainerRef}
      className="relative rounded-xl overflow-hidden aspect-video bg-black shadow-2xl"
      onClick={(e) => {
        togglePlay(e);
        toggleControlsVisibility(true);  // Show controls when video is clicked
      }}
      onMouseEnter={() => toggleControlsVisibility(true)}
      onMouseLeave={() => toggleControlsVisibility(false)}
      onMouseMove={() => toggleControlsVisibility(true)}
      onDoubleClick={toggleFullscreen}
    >
      <video ref={videoRef} poster={thumbnail} width="100%" height="100%" crossOrigin='anonymous' className='aspect-video z-10' playsInline={true} />

      <div className={`video-controls z-50 absolute bottom-0 right-0 left-0 w-full p-3 flex flex-col group bg-gradient-to-t from-black/80 pt-24 duration-500 ${isControlsVisible ?
        'visible opacity-100' : 'opacity-0 bottom-[-50px]'} ${styles.fadeEffect}`}>
        <div className={styles.progressBarPlayerContainerParent}>
          <div className={styles.progressBarPlayerContainer}
            onClick={(e) => handleProgressClick(e)}
            onMouseDown={(e) => handleDragStart(e)}
            onMouseMove={(e) => handleDrag(e, handleProgressClick)}
            onMouseUp={(e) => handleDragEnd(e)}
            onMouseLeave={(e) => handleDragEnd(e)}
          >
            <div className={styles.progressBarBuffer} style={{ width: `${bufferProgress}%` }}></div>
            <div className={styles.progressBarPlayer} style={{ width: `${progress}%` }}></div>
          </div>
          <div className='flex justify-between'>
            {timer.total > 0 &&
              <>
                <span className='text-xs text-white'>
                  {new Date(timer.current * 1000).toISOString().substr(11, 8)}
                </span>

                <span className='text-xs text-white'>
                  {new Date(timer.total * 1000).toISOString().substr(11, 8)}
                </span>
              </>
            }
          </div>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div className='flex gap-4 items-center'>
            <button onClick={togglePlay} className='backdrop-blur-xl bg-slate-500/10 w-10 h-10 aspect-square text-sm text-center p-0 outline-none border-none focus:outline-none focus:border-none'>
              {!isPlaying ?
                <FontAwesomeIcon icon={['fa', 'play']} /> :
                <FontAwesomeIcon icon={['fa', 'pause']} />
              }
            </button>

            <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
              <FontAwesomeIcon icon={['fa', 'volume-up']} className='text-white text-sm' />
              <div className={styles.progressBarVolumeContainer}
                onClick={handleVolumeChange}
                onMouseDown={(e) => handleDragStart(e)}
                onMouseMove={(e) => handleDrag(e, handleVolumeChange)}
                onMouseUp={(e) => handleDragEnd(e)}
                onMouseLeave={(e) => handleDragEnd(e)}
              >
                <div className={styles.progressBarVolume} style={{ width: `${volume}%` }}></div>
              </div>
            </div>
          </div>
          <div className='flex gap-3 items-center'>
            <div className="quality-controls">
              <div className={`absolute bottom-16 z-50 max-h-80 overflow-y-auto ${qualityChangeToggle ? 'block' : 'hidden'}`}>
                <ul className='gap-y-1 flex flex-col'>
                  {levels.map((level, index) => (
                    <li key={index}>
                      <button onClick={
                        (e) => handleQualityChange(e, index)
                      } className={`z-50 flex items-center justify-center gap-1 backdrop-blur-xl bg-slate-500/10 w-20 h-10 text-sm text-center p-0 outline-none border-none focus:outline-none focus:border-none ${currentLevel === index ? 'bg-slate-500/20' : ''}`
                      }>
                        <span className="text-[8px]">
                          {currentLevel === index &&
                            <FontAwesomeIcon icon={['fa', 'circle']} />
                          }
                        </span>
                        {level.height}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button onClick={
                      (e) => handleQualityChange(e, -1)
                    } className={`z-50 flex items-center justify-center gap-1 backdrop-blur-xl bg-slate-500/10 w-20 h-10 text-sm text-center p-0 outline-none border-none focus:outline-none focus:border-none ${currentLevel === -1 ? 'bg-slate-500/20' : ''}`
                    }>
                      <span className="text-[8px]">
                        {currentLevel === -1 &&
                          <FontAwesomeIcon icon={['fa', 'circle']} />
                        }
                      </span>
                      Auto
                    </button>
                  </li>
                </ul>
              </div>
              <button className='relative backdrop-blur-xl bg-slate-500/10 w-20 h-10 text-sm text-center p-0 outline-none border-none focus:outline-none focus:border-none'
                onClick={toogleQualityChange}>
                {/* Get the select quality label */}
                {currentLevel === -1 ? 'Auto' : levels[currentLevel].height}
              </button>
            </div>
            <button onClick={toggleFullscreen} className='backdrop-blur-xl bg-slate-500/10 w-10 h-10 aspect-square text-sm text-center p-0 outline-none border-none focus:outline-none focus:border-none'>
              {!isFullscreen ?
                <FontAwesomeIcon icon={['fa', 'expand']} /> :
                <FontAwesomeIcon icon={['fa', 'compress']} />
              }
            </button>
          </div>
        </div>
      </div>
      <div className={
        `absolute inset-0 z-20 flex items-center justify-center backdrop-blur-xl ${isPlaying ? `opacity-0 bottom-[-50px]'}` : 'visible opacity-100  cursor-pointer duration-300'} ${styles.fadeEffect} `
      }
        onClick={togglePlay}>
        <div className='absolute top-1/2 left-1/2 mt-[-30px] transform -translate-x-1/2 -translate-y-1/2 '>
          <FontAwesomeIcon icon={['fa', 'play']} className='text-white text-6xl' />
        </div>
      </div>
    </div >
  );
}