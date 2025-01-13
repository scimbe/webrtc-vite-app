import React, { useState, useEffect, useCallback } from 'react';
import { VideoStream } from './VideoStream';
import { ControlPanel } from './ControlPanel';
import { RoomInfo } from '../Room/RoomInfo';
import { RoomControls } from '../Room/RoomControls';
import { RoomChat } from '../Room/RoomChat';
import { RoomInvite } from '../Room/RoomInvite';
import { useRoomWebSocket } from '../../hooks/useRoomWebSocket';

export const VideoChat = ({
  localStream,
  remoteStream,
  peerConnection,
  roomConfig
}) => {
  const [settings, setSettings] = useState({
    video: true,
    audio: true
  });

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [roomSettings, setRoomSettings] = useState({
    maxParticipants: 2,
    isLocked: false,
    allowChat: true
  });

  // WebSocket-Verbindung
  const { status: connectionStatus, sendMessage, addMessageHandler } = useRoomWebSocket(
    roomConfig.roomId,
    roomConfig.userName,
    {
      joinMessage: {
        type: 'join',
        data: {
          userId: roomConfig.userName,
          userName: roomConfig.userName,
          isHost: roomConfig.isHost
        }
      }
    }
  );

  // WebRTC Signaling
  useEffect(() => {
    if (!peerConnection) return;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        participants.forEach(participant => {
          if (participant.userId !== roomConfig.userName) {
            sendMessage('webrtc_signal', {
              target: participant.userId,
              signal: {
                type: 'candidate',
                ...event.candidate
              }
            });
          }
        });
      }
    };

    const cleanup = addMessageHandler('webrtc_signal', ({ signal, sender }) => {
      if (signal.type === 'offer') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal))
          .then(() => peerConnection.createAnswer())
          .then(answer => peerConnection.setLocalDescription(answer))
          .then(() => {
            sendMessage('webrtc_signal', {
              target: sender,
              signal: peerConnection.localDescription
            });
          })
          .catch(error => console.error('Error handling offer:', error));
      } else if (signal.type === 'answer') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal))
          .catch(error => console.error('Error handling answer:', error));
      } else if (signal.type === 'candidate') {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal))
          .catch(error => console.error('Error handling ICE candidate:', error));
      }
    });

    return cleanup;
  }, [peerConnection, participants, sendMessage, addMessageHandler, roomConfig.userName]);

  // Room Status Handler
  useEffect(() => {
    const cleanup = addMessageHandler('room_status', ({ participants: newParticipants, settings }) => {
      setParticipants(newParticipants);
      setRoomSettings(settings);

      // Initiiere Verbindung wenn neuer Teilnehmer
      if (roomConfig.isHost && newParticipants.length > 1 && peerConnection) {
        const peer = newParticipants.find(p => p.userId !== roomConfig.userName);
        if (peer) {
          peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
              sendMessage('webrtc_signal', {
                target: peer.userId,
                signal: peerConnection.localDescription
              });
            })
            .catch(error => console.error('Error creating offer:', error));
        }
      }
    });

    return cleanup;
  }, [addMessageHandler, roomConfig.isHost, roomConfig.userName, peerConnection, sendMessage]);

  // Chat Handler
  useEffect(() => {
    const cleanup = addMessageHandler('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return cleanup;
  }, [addMessageHandler]);

  // Media Controls
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !settings.video;
      });
      setSettings(prev => ({ ...prev, video: !prev.video }));
    }
  }, [localStream, settings.video]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !settings.audio;
      });
      setSettings(prev => ({ ...prev, audio: !prev.audio }));
    }
  }, [localStream, settings.audio]);

  // Room Controls
  const handleUpdateSettings = useCallback((newSettings) => {
    if (roomConfig.isHost) {
      sendMessage('update_settings', newSettings);
    }
  }, [roomConfig.isHost, sendMessage]);

  const handleKickParticipant = useCallback((participantId) => {
    if (roomConfig.isHost) {
      sendMessage('kick_participant', { participantId });
    }
  }, [roomConfig.isHost, sendMessage]);

  const handleSendMessage = useCallback((text) => {
    if (roomSettings.allowChat) {
      sendMessage('chat_message', { text });
    }
  }, [roomSettings.allowChat, sendMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <RoomInfo 
            roomId={roomConfig.roomId}
            participants={participants}
            connectionStatus={connectionStatus}
          />
          
          <div className="flex items-center space-x-2">
            <RoomInvite roomId={roomConfig.roomId} />
            <RoomChat
              messages={messages}
              onSendMessage={handleSendMessage}
              enabled={roomSettings.allowChat}
            />
            {roomConfig.isHost && (
              <RoomControls
                settings={roomSettings}
                onUpdateSettings={handleUpdateSettings}
                onKickParticipant={handleKickParticipant}
              />
            )}
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
                    {connectionStatus === 'connected' 
                      ? 'Warte auf andere Teilnehmer...'
                      : 'Verbindung wird hergestellt...'}
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
            <div className="bg-slate-800 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">Teilnehmer</h2>
              <ul className="space-y-2">
                {participants.map(participant => (
                  <li 
                    key={participant.userId}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-white">{participant.userName}</span>
                    {participant.isHost && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        Host
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
