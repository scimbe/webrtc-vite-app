import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export function useRoomConnection(roomId, userName, isHost) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [participants, setParticipants] = useState([]);
  const wsUrl = `ws://localhost:3001/room/${roomId}`;
  
  const { isConnected, sendMessage, addMessageHandler, error: wsError } = useWebSocket(wsUrl);

  // Error handling
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket connection error:', wsError);
      setConnectionState('error');
    }
  }, [wsError]);

  useEffect(() => {
    if (isConnected) {
      // Initial room join
      sendMessage({
        type: 'join',
        data: {
          userId: userName,
          userName,
          isHost,
          timestamp: new Date().toISOString()
        }
      });
      setConnectionState('connecting');
    }
  }, [isConnected, sendMessage, userName, isHost]);

  useEffect(() => {
    const cleanupHandlers = [
      addMessageHandler('room_status', (status) => {
        console.log('Room status received:', status);
        setParticipants(status.participants || []);
        setConnectionState('connected');
      }),
      addMessageHandler('participant_joined', (participant) => {
        console.log('Participant joined:', participant);
        setParticipants(prev => {
          // Avoid duplicates
          if (!prev.some(p => p.userId === participant.userId)) {
            return [...prev, participant];
          }
          return prev;
        });
      }),
      addMessageHandler('participant_left', (participant) => {
        console.log('Participant left:', participant);
        setParticipants(prev => prev.filter(p => p.userId !== participant.userId));
      }),
      addMessageHandler('error', (errorMsg) => {
        console.error('Room connection error:', errorMsg);
        setConnectionState('error');
      })
    ];

    return () => {
      cleanupHandlers.forEach(cleanup => cleanup());
    };
  }, [addMessageHandler]);

  const kickParticipant = useCallback((participantId) => {
    if (!isHost) return;
    
    sendMessage({
      type: 'kick_participant',
      data: { participantId }
    });
  }, [isHost, sendMessage]);

  const updateRoomSettings = useCallback((settings) => {
    if (!isHost) return;

    sendMessage({
      type: 'update_settings',
      data: settings
    });
  }, [isHost, sendMessage]);

  return {
    connectionState,
    participants,
    isConnected,
    kickParticipant,
    updateRoomSettings
  };
}