import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

export function useRoomConnection(roomId, userName, isHost) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [participants, setParticipants] = useState([]);
  const userNameRef = useRef(userName);
  const isHostRef = useRef(isHost);
  
  // Sichere WebSocket-URL Generierung
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.hostname}:3001/room/${roomId}`;
  
  const { 
    isConnected, 
    sendMessage, 
    addMessageHandler, 
    error: wsError 
  } = useWebSocket(wsUrl);

  // Ref-Werte aktualisieren
  useEffect(() => {
    userNameRef.current = userName;
    isHostRef.current = isHost;
  }, [userName, isHost]);

  // WebSocket-Verbindungszustand
  useEffect(() => {
    if (!isConnected) return;

    // Raum beitreten, wenn Verbindung hergestellt
    const joinMessage = {
      type: 'join',
      data: {
        userId: userName,
        userName,
        isHost,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Sende Beitrittsnachricht:', joinMessage);
    
    const timeoutId = setTimeout(() => {
      sendMessage(joinMessage);
      setConnectionState('connecting');
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isConnected, sendMessage, userName, isHost]);

  // Fehlerbehandlung
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket-Verbindungsfehler:', {
        error: wsError,
        userName,
        roomId,
        isHost
      });
      setConnectionState('error');
    }
  }, [wsError, userName, roomId, isHost]);

  // Nachrichtenhandler
  useEffect(() => {
    if (!addMessageHandler) return;

    const handlers = {
      room_status: (status) => {
        console.log('Raumstatus erhalten:', status);
        if (status?.participants) {
          setParticipants(status.participants);
          setConnectionState('connected');
        }
      },
      participant_joined: (participant) => {
        if (!participant?.userId) return;
        console.log('Teilnehmer beigetreten:', participant);
        setParticipants(prev => {
          if (!prev.some(p => p.userId === participant.userId)) {
            return [...prev, participant];
          }
          return prev;
        });
      },
      participant_left: (participant) => {
        if (!participant?.userId) return;
        console.log('Teilnehmer verlassen:', participant);
        setParticipants(prev => prev.filter(p => p.userId !== participant.userId));
      },
      error: (errorMsg) => {
        console.error('Raum-Verbindungsfehler:', errorMsg);
        setConnectionState('error');
      }
    };

    const cleanupHandlers = Object.entries(handlers).map(([type, handler]) => 
      addMessageHandler(type, handler)
    );

    return () => {
      cleanupHandlers.forEach(cleanup => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, [addMessageHandler]);

  const kickParticipant = useCallback((participantId) => {
    if (!isHostRef.current || !participantId) return;
    
    sendMessage({
      type: 'kick_participant',
      data: { participantId: String(participantId) }
    });
  }, [sendMessage]);

  const updateRoomSettings = useCallback((settings) => {
    if (!isHostRef.current || !settings) return;

    sendMessage({
      type: 'update_settings',
      data: settings
    });
  }, [sendMessage]);

  return {
    connectionState,
    participants,
    isConnected: Boolean(isConnected),
    kickParticipant,
    updateRoomSettings
  };
}