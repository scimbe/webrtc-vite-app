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
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, localStream]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 mb-20">
        {/* Lokaler Stream */}
        <div className="relative aspect-video">
          <VideoStream
            stream={localStream}
            isMuted={true}
            label={`${roomConfig.userName} (Du)`}
            isLocal={true}
            isCameraOff={isVideoOff}
          />
        </div>

        {/* Remote Stream */}
        <div className="relative aspect-video">
          {remoteStream ? (
            <VideoStream
              stream={remoteStream}
              isMuted={false}
              label={participants.find(p => p.id !== roomConfig.userId)?.name || 'Remote User'}
              isLocal={false}
            />
          ) : (
            <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-400">
                {connectionState === 'connecting'
                  ? 'Verbindung wird hergestellt...'
                  : 'Warte auf Teilnehmer...'}
              </p>
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
        participants={participants}
        connectionState={connectionState}
      />
    </div>
  );
};