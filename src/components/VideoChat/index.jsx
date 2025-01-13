import React, { useState, useCallback } from 'react';
import { VideoStream } from './VideoStream';
import { Controls } from './Controls';
import { useMediaStream } from '../../hooks/useMediaStream';
import { usePeerConnection } from '../../hooks/usePeerConnection';

export const VideoChat = () => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { stream, error: mediaError } = useMediaStream({ video: videoEnabled, audio: audioEnabled });
  const {
    remoteStream,
    connectionState,
    createOffer,
    handleAnswer,
    handleOffer
  } = usePeerConnection(stream);

  const handleStartCall = useCallback(async () => {
    const offer = await createOffer();
    if (offer) {
      // TODO: Send offer through signaling server
      console.log('Created offer:', offer);
    }
  }, [createOffer]);

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

  if (mediaError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full">
          <p className="text-red-700">Error accessing media devices: {mediaError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto p-4">
        <div className="relative min-h-[calc(100vh-2rem)]">
          {/* Connection Status */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`px-3 py-1 rounded-full text-sm ${connectionState === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}>
              {connectionState.charAt(0).toUpperCase() + connectionState.slice(1)}
            </span>
          </div>

          {/* Remote Stream */}
          <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4">
            {remoteStream ? (
              <VideoStream stream={remoteStream} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <button
                  onClick={handleStartCall}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Call
                </button>
              </div>
            )}
          </div>
          
          {/* Local Stream */}
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