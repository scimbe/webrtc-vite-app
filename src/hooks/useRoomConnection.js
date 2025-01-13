import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

export function useRoomConnection(roomId, userName, isHost) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [participants, setParticipants] = useState([]);
  const userNameRef = useRef(userName);
  const isHostRef = useRef(isHost);
  
  // Dynamische WebSocket-URL
  const wsUrl = `ws://${window.location.hostname}:3001/room/${roomId}`;
  
  const { 
    isConnected, 
    sendMessage, 
    addMessageHandler, 
    error: wsError,
    ws 
  } = useWebSocket(wsUrl);

  // Ref-Werte aktualisieren
  useEffect(() => {
    userNameRef.current = userName;
    isHostRef.current = isHost;
  }, [userName, isHost]);

  // WebSocket-Verbindungszustand
  useEffect(() => {
    console.log('WebSocket-Status:', {
      isConnected,
      readyState: ws?.readyState,
      url: wsUrl
    });

    if (isConnected && ws?.readyState === WebSocket.OPEN) {
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
      
      // Nachricht mit Verzögerung senden, um Race Conditions zu vermeiden
      const timeoutId = setTimeout(() => {
        sendMessage(joinMessage);
        setConnectionState('connecting');
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, ws?.readyState, sendMessage, userName, isHost, wsUrl]);

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
    const cleanupHandlers = [
      addMessageHandler('room_status', (status) => {
        console.log('Raumstatus erhalten:', status);
        setParticipants(status.participants || []);
        setConnectionState('connected');
      }),
      addMessageHandler('participant_joined', (participant) => {
        console.log('Teilnehmer beigetreten:', participant);
        setParticipants(prev => {
          // Duplikate vermeiden
          if (!prev.some(p => p.userId === participant.userId)) {
            return [...prev, participant];
          }
          return prev;
        });
      }),
      addMessageHandler('participant_left', (participant) => {
        console.log('Teilnehmer verlassen:', participant);
        setParticipants(prev => prev.filter(p => p.userId !== participant.userId));
      }),
      addMessageHandler('error', (errorMsg) => {
        console.error('Raum-Verbindungsfehler:', errorMsg);
        setConnectionState('error');
      })
    ];

    return () => {
      cleanupHandlers.forEach(cleanup => cleanup());
    };
  }, [addMessageHandler]);

  const kickParticipant = useCallback((participantId) => {
    if (!isHostRef.current) return;
    
    sendMessage({
      type: 'kick_participant',
      data: { participantId }
    });
  }, [sendMessage]);

  const updateRoomSettings = useCallback((settings) => {
    if (!isHostRef.current) return;

    sendMessage({
      type: 'update_settings',
      data: settings
    });
  }, [sendMessage]);

  return {
    connectionState,
    participants,
    isConnected: isConnected && ws?.readyState === WebSocket.OPEN,
    kickParticipant,
    updateRoomSettings
  };
}