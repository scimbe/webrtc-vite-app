import React, { useEffect, useState, useCallback, memo } from 'react';
import { VideoStream } from './VideoStream';
import { ControlPanel } from './ControlPanel';

export const VideoChat = memo(({ 
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
  
  const handleAudioToggle = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      const newMutedState = !isMuted;
      audioTracks.forEach(track => {
        track.enabled = !newMutedState;
      });
      setIsMuted(newMutedState);
    }
  }, [localStream, isMuted]);

  const handleVideoToggle = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const newVideoOffState = !isVideoOff;
      videoTracks.forEach(track => {
        track.enabled = !newVideoOffState;
      });
      setIsVideoOff(newVideoOffState);
    }
  }, [localStream, isVideoOff]);

  useEffect(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      const videoTracks = localStream.getVideoTracks();

      return () => {
        audioTracks.forEach(track => track.stop());
        videoTracks.forEach(track => track.stop());
      };
    }
  }, [localStream]);

  const remoteParticipant = participants.find(p => p.id !== roomConfig.userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 mb-20">
        {/* Local Stream */}
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
              label={remoteParticipant?.name || 'Remote User'}
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
        onToggleMute={handleAudioToggle}
        onToggleVideo={handleVideoToggle}
        onLeave={() => window.location.href = '/'}
        isHost={roomConfig.isHost}
        participants={participants}
        connectionState={connectionState}
      />
    </div>
  );
});

VideoChat.displayName = 'VideoChat';