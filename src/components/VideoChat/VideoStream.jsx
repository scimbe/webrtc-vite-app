import React, { useRef, useEffect } from 'react';

export const VideoStream = ({ stream, isMuted = false, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative rounded-lg overflow-hidden ${isLocal ? 'w-32 h-32 md:w-48 md:h-48' : 'w-full aspect-video'}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover ${isLocal ? 'mirror' : ''}`}
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
        {isLocal ? 'You' : 'Remote'}
      </div>
    </div>
  );
};