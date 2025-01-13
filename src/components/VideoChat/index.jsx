import React, { useState, useCallback } from 'react';
import { VideoStream } from './VideoStream';
import { Controls } from './Controls';
import { useMediaStream } from '../../hooks/useMediaStream';
import { usePeerConnection } from '../../hooks/usePeerConnection';
import { useWebSocket } from '../../hooks/useWebSocket';

export const VideoChat = () => {
  const [roomId] = useState(`room-${Math.random().toString(36).substr(2, 9)}`);
  const { stream, error: mediaError } = useMediaStream();
  const { status, sendMessage } = useWebSocket(`ws://localhost:3001/room/${roomId}`);

  const handleIceCandidate = useCallback((candidate) => {
    sendMessage('ice-candidate', { candidate });
  }, [sendMessage]);

  const {
    remoteStream,
    connectionState,
    createOffer,
    handleAnswer,
    handleOffer,
    addIceCandidate
  } = usePeerConnection(stream, handleIceCandidate);

  // ... Rest der Komponenten-Implementation

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto p-4">
        <div className="relative min-h-[calc(100vh-2rem)]">
          {/* Status Anzeige */}
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white text-sm">
                {connectionState.charAt(0).toUpperCase() + connectionState.slice(1)}
              </span>
            </div>
          </div>

          {/* Remote Stream */}
          <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4">
            {remoteStream ? (
              <VideoStream stream={remoteStream} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Waiting for connection...
              </div>
            )}
          </div>

          {/* Local Stream (Picture-in-Picture) */}
          <div className="absolute top-4 right-4">
            {stream && <VideoStream stream={stream} isMuted isLocal />}
          </div>
        </div>
      </div>
    </div>
  );
};