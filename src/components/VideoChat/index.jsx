import React, { useState } from 'react';
import { VideoStream } from './VideoStream';
import { Controls } from './Controls';
import { useMediaStream } from '../../hooks/useMediaStream';

export const VideoChat = () => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { stream, error } = useMediaStream({ video: videoEnabled, audio: audioEnabled });

  const handleToggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleToggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full">
          <p className="text-red-700">Error accessing media devices: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto p-4">
        <div className="relative min-h-[calc(100vh-2rem)]">
          {/* Remote Stream (Placeholder for now) */}
          <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4">
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">Waiting for remote connection...</p>
            </div>
          </div>
          
          {/* Local Stream (Picture-in-Picture) */}
          <div className="absolute top-4 right-4">
            {stream && <VideoStream stream={stream} isMuted isLocal />}
          </div>

          {/* Controls */}
          <Controls
            videoEnabled={videoEnabled}
            audioEnabled={audioEnabled}
            onToggleVideo={handleToggleVideo}
            onToggleAudio={handleToggleAudio}
          />
        </div>
      </div>
    </div>
  );
};