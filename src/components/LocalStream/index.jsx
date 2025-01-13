import React, { useEffect, useRef } from 'react';
import { useMediaStream } from '../../hooks/useMediaStream';

export const LocalStream = () => {
  const videoRef = useRef(null);
  const { stream, error } = useMediaStream();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">Error accessing media devices: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-video bg-gray-900 rounded-lg shadow-lg"
      />
    </div>
  );
};