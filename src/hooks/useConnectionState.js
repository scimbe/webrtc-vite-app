import { useState, useCallback, useEffect } from 'react';

export function useConnectionState(peerConnection) {
  const [state, setState] = useState({
    status: 'disconnected',
    error: null,
    lastActive: null,
    reconnectAttempts: 0
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      ...updates,
      lastActive: updates.status === 'connected' ? new Date() : prev.lastActive
    }));
  }, []);

  useEffect(() => {
    if (!peerConnection) {
      updateState({ status: 'disconnected' });
      return;
    }

    const handleConnectionChange = () => {
      const status = peerConnection.connectionState;
      updateState({
        status,
        error: status === 'failed' ? new Error('Connection failed') : null,
        reconnectAttempts: status === 'failed' ? state.reconnectAttempts + 1 : 0
      });
    };

    const handleIceConnectionChange = () => {
      if (peerConnection.iceConnectionState === 'disconnected') {
        updateState({
          status: 'reconnecting',
          reconnectAttempts: state.reconnectAttempts + 1
        });
      }
    };

    const handleNegotiationNeeded = () => {
      updateState({ status: 'negotiating' });
    };

    peerConnection.onconnectionstatechange = handleConnectionChange;
    peerConnection.oniceconnectionstatechange = handleIceConnectionChange;
    peerConnection.onnegotiationneeded = handleNegotiationNeeded;

    return () => {
      peerConnection.onconnectionstatechange = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.onnegotiationneeded = null;
    };
  }, [peerConnection, updateState, state.reconnectAttempts]);

  return state;
}