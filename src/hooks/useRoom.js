import { useState, useCallback } from 'react';

export function useRoom() {
  const [roomState, setRoomState] = useState({
    id: null,
    isHost: false,
    participants: [],
    settings: {
      maxParticipants: 2,
      isLocked: false,
      allowChat: true,
      requirePermission: false
    }
  });

  const initializeAsHost = useCallback((roomId) => {
    setRoomState(prev => ({
      ...prev,
      id: roomId,
      isHost: true,
      participants: []
    }));
  }, []);

  const joinRoom = useCallback((roomId) => {
    setRoomState(prev => ({
      ...prev,
      id: roomId,
      isHost: false,
      participants: []
    }));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setRoomState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
  }, []);

  const addParticipant = useCallback((participant) => {
    setRoomState(prev => {
      if (prev.settings.isLocked) {
        throw new Error('Room is locked');
      }
      if (prev.participants.length >= prev.settings.maxParticipants) {
        throw new Error('Room is full');
      }
      return {
        ...prev,
        participants: [...prev.participants, participant]
      };
    });
  }, []);

  const removeParticipant = useCallback((participantId) => {
    setRoomState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }));
  }, []);

  const lockRoom = useCallback(() => {
    setRoomState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        isLocked: true
      }
    }));
  }, []);

  const unlockRoom = useCallback(() => {
    setRoomState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        isLocked: false
      }
    }));
  }, []);

  return {
    ...roomState,
    initializeAsHost,
    joinRoom,
    updateSettings,
    addParticipant,
    removeParticipant,
    lockRoom,
    unlockRoom
  };
}