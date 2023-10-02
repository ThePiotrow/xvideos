import React, { useEffect, useRef, useState } from 'react';


const Video = ({ username, stream, muted }) => {
    const ref = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream;
        if (muted) setIsMuted(muted);
        console.log("stream", stream, "muted", muted)
    }, [stream, muted]);

    return (
        <>
            <video ref={ref} muted={isMuted} autoPlay />
            <h2>{username}</h2>
        </>
    );
};

export default Video;