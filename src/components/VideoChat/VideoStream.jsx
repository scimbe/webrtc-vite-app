import React, { useRef, useEffect } from 'react';

export const VideoStream = ({ stream, isMuted = false, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''}`}
      />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
        {isLocal ? 'You' : 'Remote'}
      </div>
    </div>
  );
};