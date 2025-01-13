import { useState, useCallback } from 'react';

export function useRoomState(initialSettings = {}) {
  const [roomState, setRoomState] = useState({
    settings: {
      maxParticipants: 2,
      isLocked: false,
      allowChat: true,
      requirePermission: false,
      ...initialSettings
    },
    participants: [],
    messages: [],
    pendingPermissions: []
  });

  const addMessage = useCallback((message) => {
    setRoomState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...message
      }]
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

  const requestPermission = useCallback((userId) => {
    setRoomState(prev => ({
      ...prev,
      pendingPermissions: [...prev.pendingPermissions, {
        userId,
        timestamp: new Date().toISOString()
      }]
    }));
  }, []);

  const handlePermissionResponse = useCallback((userId, accepted) => {
    setRoomState(prev => ({
      ...prev,
      pendingPermissions: prev.pendingPermissions.filter(p => p.userId !== userId)
    }));
  }, []);

  return {
    ...roomState,
    addMessage,
    updateSettings,
    requestPermission,
    handlePermissionResponse
  };
}