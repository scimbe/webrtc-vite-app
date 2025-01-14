import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { VideoChat } from '../../components/VideoChat/VideoChat';
import { WaitingRoom } from '../../components/Room/WaitingRoom';
import { useMediaStream } from '../../hooks/useMediaStream';
import { usePeerConnection } from '../../hooks/usePeerConnection';
import { useRoomConnection } from '../../hooks/useRoomConnection';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export const RoomPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const userName = searchParams.get('userName');
  const isHost = searchParams.get('isHost') === '1';

  const [isInWaitingRoom, setIsInWaitingRoom] = useState(true);
  const { stream: localStream, error: mediaError } = useMediaStream();
  const { peerConnection, remoteStream, error: peerError } = usePeerConnection(localStream);
  
  const { 
    connectionState, 
    participants, 
    isConnected, 
    kickParticipant, 
    updateRoomSettings,
    error: roomError 
  } = useRoomConnection(roomId, userName, isHost);

  const {
    sendNotification,
    requestPermission,
    error: pushError
  } = usePushNotifications();

  // Parameter validation
  useEffect(() => {
    if (!userName || !roomId) {
      navigate('/', { 
        state: { error: 'Fehlende Parameter: Benutzername oder Raum-ID' } 
      });
    }
  }, [userName, roomId, navigate]);

  // Error handling
  useEffect(() => {
    const error = mediaError || peerError || roomError || pushError;
    if (error) {
      console.error('Fehler aufgetreten:', error);
      navigate('/', { 
        state: { error: error.message } 
      });
    }
  }, [mediaError, peerError, roomError, pushError, navigate]);

  // Connection state monitoring
  useEffect(() => {
    if (connectionState === 'connected' && !isInWaitingRoom) {
      sendNotification({
        title: 'WebRTC Meeting',
        body: `${userName} ist dem Raum beigetreten`,
        icon: '/icon.png'
      });
    }
  }, [connectionState, isInWaitingRoom, userName, sendNotification]);

  // Request push notification permission
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  if (isInWaitingRoom) {
    return (
      <WaitingRoom
        userName={userName}
        stream={localStream}
        onReady={() => setIsInWaitingRoom(false)}
      />
    );
  }

  return (
    <VideoChat
      peerConnection={peerConnection}
      localStream={localStream}
      remoteStream={remoteStream}
      roomConfig={{
        roomId,
        userName,
        isHost
      }}
      connectionState={connectionState}
      participants={participants}
      onKickParticipant={kickParticipant}
      onUpdateSettings={updateRoomSettings}
      isConnected={isConnected}
    />
  );
};

export default RoomPage;