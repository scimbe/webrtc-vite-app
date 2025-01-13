import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export function useRoomConnection(roomId, userId, isHost) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [participants, setParticipants] = useState([]);
  const wsUrl = `ws://localhost:3001/room/${roomId}`;
  
  const { isConnected, sendMessage, addMessageHandler } = useWebSocket(wsUrl);

  useEffect(() => {
    if (isConnected) {
      // Initial room join
      sendMessage({
        type: 'join',
        data: {
          userId,
          isHost,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [isConnected, sendMessage, userId, isHost]);

  const handleParticipantJoin = useCallback((participant) => {
    setParticipants(prev => [...prev, participant]);
    setConnectionState('connecting');

    // Wenn Host, sende Raumstatus
    if (isHost) {
      sendMessage({
        type: 'room_status',
        data: {
          participants: participants,
          settings: {
            maxParticipants: 2,
            isLocked: false
          }
        }
      });
    }
  }, [isHost, sendMessage, participants]);

  const handleParticipantLeave = useCallback((participantId) => {
    setParticipants(prev => prev.filter(p => p.userId !== participantId));
  }, []);

  useEffect(() => {
    const cleanup = [
      addMessageHandler('participant_joined', handleParticipantJoin),
      addMessageHandler('participant_left', handleParticipantLeave),
      addMessageHandler('room_status', (status) => {
        setParticipants(status.participants);
      }),
      addMessageHandler('connection_state', (state) => {
        setConnectionState(state);
      })
    ];

    return () => cleanup.forEach(fn => fn());
  }, [addMessageHandler, handleParticipantJoin, handleParticipantLeave]);

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