import React, { useEffect, useRef, memo } from 'react';
import { Camera } from 'lucide-react';

export const VideoStream = memo(({
  stream,
  isMuted = false,
  label,
  isLocal = false,
  isCameraOff = false
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
    }
    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-800">
      {stream && !isCameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Camera className="w-16 h-16 text-slate-600" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm font-medium truncate">
          {label}
        </p>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Nur neu rendern wenn sich wichtige Props ändern
  return (
    prevProps.stream === nextProps.stream &&
    prevProps.isMuted === nextProps.isMuted &&
    prevProps.isCameraOff === nextProps.isCameraOff &&
    prevProps.label === nextProps.label
  );
});

VideoStream.displayName = 'VideoStream';