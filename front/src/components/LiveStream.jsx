import React from 'react';

class LiveStream extends React.Component {
    componentDidMount() {
        if (Hls.isSupported()) {
            const video = this.videoRef;
            const hls = new Hls();
            hls.loadSource('URL_DU_FLUX_HLS.m3u8'); // Remplacez par votre URL de flux HLS
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = 'URL_DU_FLUX_HLS.m3u8';  // Remplacez par votre URL de flux HLS
            video.addEventListener('loadedmetadata', function() {
                video.play();
            });
        }
    }

    render() {
        return (
            <video ref={ref => this.videoRef = ref} controls width="100%" height="auto"></video>
        );
    }
}

export default LiveStream;
