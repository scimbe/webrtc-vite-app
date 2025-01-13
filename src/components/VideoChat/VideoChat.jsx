import React, { useState, useEffect, useCallback } from 'react';
import { VideoStream } from '../VideoStream';
import { ControlPanel } from '../ControlPanel';
import { RoomInfo } from '../Room/RoomInfo';
import { RoomControls } from '../Room/RoomControls';
import { RoomChat } from '../Room/RoomChat';
import { RoomInvite } from '../Room/RoomInvite';
import { useRoomWebSocket } from '../../hooks/useRoomWebSocket';

export const VideoChat = ({
  peerConnection,
  localStream,
  remoteStream,
  roomConfig,
  connectionState,
  participants,
  onKickParticipant,
  onUpdateSettings,
  ...roomState
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [localMediaSettings, setLocalMediaSettings] = useState({
    audio: true,
    video: true
  });

  const { sendMessage, messages } = useRoomWebSocket(roomConfig.roomId, roomConfig.userName);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleInvite = () => {
    setIsInviteOpen(!isInviteOpen);
  };

  const handleMediaSettingsChange = useCallback((type, enabled) => {
    setLocalMediaSettings(prev => ({
      ...prev,
      [type]: enabled
    }));

    // Additional logic to actually change media tracks
    if (localStream) {
      const tracks = type === 'audio' 
        ? localStream.getAudioTracks() 
        : localStream.getVideoTracks();
      
      tracks.forEach(track => {
        track.enabled = enabled;
      });
    }
  }, [localStream]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className={`flex-1 flex items-center justify-center relative ${isChatOpen ? 'w-2/3' : 'w-full'}`}>
          <VideoStream 
            localStream={localStream} 
            remoteStream={remoteStream} 
            connectionState={connectionState}
          />
          
          <ControlPanel 
            onToggleChat={toggleChat} 
            onToggleInvite={toggleInvite}
            localMediaSettings={localMediaSettings}
            onMediaSettingsChange={handleMediaSettingsChange}
          />
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <RoomChat 
            messages={messages} 
            sendMessage={sendMessage} 
            onClose={toggleChat} 
          />
        )}
      </div>

      {/* Room Controls */}
      <RoomControls 
        roomConfig={roomConfig}
        participants={participants}
        onKickParticipant={onKickParticipant}
        onUpdateSettings={onUpdateSettings}
      />

      {/* Room Invite Modal */}
      {isInviteOpen && (
        <RoomInvite 
          roomId={roomConfig.roomId} 
          onClose={toggleInvite} 
        />
      )}
    </div>
  );
};