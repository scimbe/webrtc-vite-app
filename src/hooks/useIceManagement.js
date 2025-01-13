import { useEffect, useCallback, useRef } from 'react';

export function useIceManagement(peerConnection, onIceCandidate) {
  const pendingCandidates = useRef([]);
  const isConnected = useRef(false);

  const handleIceCandidate = useCallback((event) => {
    if (event.candidate) {
      if (isConnected.current) {
        onIceCandidate(event.candidate);
      } else {
        pendingCandidates.current.push(event.candidate);
      }
    }
  }, [onIceCandidate]);

  const handleConnectionStateChange = useCallback(() => {
    const state = peerConnection?.connectionState;
    isConnected.current = state === 'connected';

    if (isConnected.current && pendingCandidates.current.length > 0) {
      pendingCandidates.current.forEach(candidate => {
        onIceCandidate(candidate);
      });
      pendingCandidates.current = [];
    }
  }, [peerConnection, onIceCandidate]);

  const addIceCandidate = useCallback(async (candidate) => {
    try {
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      return false;
    }
  }, [peerConnection]);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.onicecandidate = handleIceCandidate;
      peerConnection.onconnectionstatechange = handleConnectionStateChange;
      
      return () => {
        peerConnection.onicecandidate = null;
        peerConnection.onconnectionstatechange = null;
      };
    }
  }, [peerConnection, handleIceCandidate, handleConnectionStateChange]);

  return { addIceCandidate };
}