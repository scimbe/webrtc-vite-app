import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { VideoChat } from '../../components/VideoChat/VideoChat';
import { WaitingRoom } from '../../components/Room/WaitingRoom';
import { useMediaStream } from '../../hooks/useMediaStream';
import { usePeerConnection } from '../../hooks/usePeerConnection';
import { useRoom } from '../../hooks/useRoom';

export const RoomPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userName = searchParams.get('userName');
  const isHost = searchParams.get('isHost') === '1';

  const [isInWaitingRoom, setIsInWaitingRoom] = useState(true);
  const { stream: localStream, error: mediaError } = useMediaStream();
  const { peerConnection, remoteStream } = usePeerConnection(localStream);
  const roomHook = useRoom();

  useEffect(() => {
    if (!userName || !roomId) {
      navigate('/');
      return;
    }

    // Raum initialisieren
    if (isHost) {
      roomHook.initializeAsHost(roomId);
    } else {
      roomHook.joinRoom(roomId);
    }
  }, [roomId, userName, isHost, navigate, roomHook]);

  if (mediaError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-500 text-white p-4 rounded-lg max-w-md">
          <h2 className="text-lg font-bold mb-2">Fehler beim Zugriff auf Kamera/Mikrofon</h2>
          <p>{mediaError.message}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-white text-red-500 rounded-lg hover:bg-red-100"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

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
      {...roomHook}
    />
  );
};