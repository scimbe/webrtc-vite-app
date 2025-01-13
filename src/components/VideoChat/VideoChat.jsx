import React, { useState, useEffect } from 'react';
import { VideoStream } from './VideoStream';
import { ControlPanel } from './ControlPanel';
import { ConnectionStatus } from '../Status/ConnectionStatus';
import { RoomInfo } from '../Room/RoomInfo';
import { RoomControls } from '../Room/RoomControls';
import { ParticipantList } from '../Room/ParticipantList';
import { RoomSettings } from '../Room/RoomSettings';
import { RoomChat } from '../Room/RoomChat';
import { RoomInvite } from '../Room/RoomInvite';
import { useRoom } from '../../hooks/useRoom';

export const VideoChat = ({ 
  peerConnection, 
  localStream, 
  remoteStream,
  roomConfig 
}) => {
  const {
    participants,
    isHost,
    roomStatus,
    lockRoom,
    unlockRoom,
    addParticipant,
    removeParticipant
  } = useRoom();

  const [settings, setSettings] = useState({
    video: true,
    audio: true
  });

  const [messages, setMessages] = useState([]);

  const handleSendMessage = (text) => {
    const newMessage = {
      text,
      sender: roomConfig.userName,
      timestamp: new Date().toISOString(),
      isSelf: true
    };
    setMessages(prev => [...prev, newMessage]);
    // Hier würde die Nachricht über WebRTC DataChannel gesendet werden
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !settings.video;
      });
      setSettings(prev => ({ ...prev, video: !prev.video }));
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !settings.audio;
      });
      setSettings(prev => ({ ...prev, audio: !prev.audio }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-4 flex justify-between items-start">
          <RoomInfo 
            roomId={roomConfig.roomId}
            participants={participants}
          />
          
          <div className="flex items-center space-x-2">
            <RoomInvite roomId={roomConfig.roomId} />
            <RoomChat
              messages={messages}
              onSendMessage={handleSendMessage}
            />
            <RoomSettings
              roomStatus={roomStatus}
              onUpdateSettings={(newSettings) => console.log('Update settings:', newSettings)}
              isHost={isHost}
            />
            <RoomControls
              isHost={isHost}
              roomStatus={roomStatus}
              onLockRoom={lockRoom}
              onUnlockRoom={unlockRoom}
              onKickParticipant={() => {}}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Video Area */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remote Stream */}
              <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-xl">
                {remoteStream ? (
                  <VideoStream
                    stream={remoteStream}
                    isMuted={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Warte auf Verbindung...
                  </div>
                )}
              </div>

              {/* Local Stream */}
              <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-xl">
                {localStream && (
                  <VideoStream
                    stream={localStream}
                    isMuted={true}
                    isLocal={true}
                    userName={roomConfig.userName}
                  />
                )}
              </div>
            </div>

            {/* Controls */}
            <ControlPanel
              settings={settings}
              onToggleVideo={toggleVideo}
              onToggleAudio={toggleAudio}
              className="mt-4"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ParticipantList
              participants={participants}
              onKickParticipant={removeParticipant}
              isHost={isHost}
            />
          </div>
        </div>
      </div>
    </div>
  );
};