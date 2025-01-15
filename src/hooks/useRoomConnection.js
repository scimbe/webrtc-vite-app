import { useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

export function useRoomConnection(roomId, userName, isHost) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [participants, setParticipants] = useState([]);
  const userNameRef = useRef(userName);
  const isHostRef = useRef(isHost);

  // Extract clean roomId if it's a URL
  const cleanRoomId = roomId.includes('ws://') ? 
    roomId.split('/').pop() : 
    roomId;

  const { 
    isConnected, 
    sendMessage, 
    addMessageHandler,
    error: wsError 
  } = useWebSocket(cleanRoomId);

  // WebSocket message handlers
  useState(() => {
    if (!isConnected) return;

    // Send join message when connected
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
  }, [isConnected, sendMessage, userName, isHost]);

  // Error handling
  useState(() => {
    if (wsError) {
      console.error('WebSocket-Verbindungsfehler:', {
        error: wsError,
        userName,
        roomId: cleanRoomId,
        isHost
      });
      setConnectionState('error');
    }
  }, [wsError, userName, cleanRoomId, isHost]);

  // Message handlers
  useState(() => {
    const handlers = [
      addMessageHandler('room_status', (status) => {
        console.log('Room status received:', status);
        setParticipants(status.participants || []);
        setConnectionState('connected');
      }),
      addMessageHandler('participant_joined', (participant) => {
        console.log('Participant joined:', participant);
        setParticipants(prev => {
          if (!prev.some(p => p.userId === participant.userId)) {
            return [...prev, participant];
          }
          return prev;
        });
      }),
      addMessageHandler('participant_left', (participant) => {
        console.log('Participant left:', participant);
        setParticipants(prev => 
          prev.filter(p => p.userId !== participant.userId)
        );
      })
    ];

    return () => handlers.forEach(cleanup => cleanup?.());
  }, [addMessageHandler]);

  const kickParticipant = useCallback((participantId) => {
    if (isHostRef.current) {
      sendMessage({
        type: 'kick_participant',
        data: { participantId }
      });
    }
  }, [sendMessage]);

  const updateRoomSettings = useCallback((settings) => {
    if (isHostRef.current) {
      sendMessage({
        type: 'update_settings',
        data: settings
      });
    }
  }, [sendMessage]);

  return {
    connectionState,
    participants,
    isConnected,
    kickParticipant,
    updateRoomSettings
  };
}