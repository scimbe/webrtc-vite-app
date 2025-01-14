import React, { useEffect, useState } from 'react';
import { VideoStream } from './VideoStream';
import { ControlPanel } from './ControlPanel';

export const VideoChat = ({
  peerConnection,
  localStream,
  remoteStream,
  roomConfig,
  connectionState,
  participants,
  onKickParticipant,
  onUpdateSettings,
  isConnected
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, localStream]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lokaler Stream */}
        <div className="relative">
          <VideoStream
            stream={localStream}
            isMuted={true}
            label={`${roomConfig.userName} (Du)`}
            isLocal={true}
          />
        </div>

        {/* Remote Stream */}
        <div className="relative">
          {remoteStream ? (
            <VideoStream
              stream={remoteStream}
              isMuted={false}
              label={participants.find(p => p.id !== roomConfig.userId)?.name || 'Remote User'}
              isLocal={false}
            />
          ) : (
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-400">Warte auf Teilnehmer...</p>
            </div>
          )}
        </div>
      </div>

      <ControlPanel
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        onLeave={() => window.location.href = '/'}
        isHost={roomConfig.isHost}
        onKickParticipant={onKickParticipant}
        participants={participants}
        connectionState={connectionState}
      />
    </div>
  );
};