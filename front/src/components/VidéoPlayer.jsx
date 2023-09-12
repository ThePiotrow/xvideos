import React from 'react';

function VideoPlayer({ videoId }) {
  const videoUrl = `http://your-gateway-service-url/medias/${videoId}/file`;

  return (
    <div className="video-player">
      <video width="320" height="240" controls>
        <source src={videoUrl} type="video/mp4" />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    </div>
  );
}

export default VideoPlayer;