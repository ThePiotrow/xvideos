import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

export const VideoJS = ({ hls, thumbnail }) => {
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 pour auto
  const videoRef = useRef(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hlsPlayer = new Hls();
      hlsPlayer.loadSource(hls);
      hlsPlayer.attachMedia(videoRef.current);

      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        // Récupérer les niveaux de qualité
        setLevels(hlsPlayer.levels);
      });

      hlsPlayer.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
        setCurrentLevel(data.level);
      });

      videoRef.current.hls = hlsPlayer; // store the hls instance on the videoRef

      console.log(hlsPlayer)
      console.log(videoRef.current)

      return () => {
        hlsPlayer.destroy();
        videoRef.current.hls = null; // clean up the reference
      };
    }
  }, [hls]);


  const handleQualityChange = (levelIndex) => {
    const hlsPlayer = videoRef.current.hls;
    hlsPlayer.currentLevel = levelIndex;
  };

  return (
    <div className="relative rounded-xl overflow-hidden">
      <video ref={videoRef} controls poster={thumbnail} width="100%" height="100%" crossOrigin='anonymous' />

      <div className="quality-controls">
        {levels.map((level, index) => (
          <button
            key={index}
            className={`quality-btn ${currentLevel === index ? 'active' : ''}`}
            onClick={() => handleQualityChange(index)}
          >
            {level.height}p
          </button>
        ))}
      </div>
    </div>
  );
}
