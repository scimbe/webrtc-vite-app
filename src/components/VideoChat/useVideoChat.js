import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

export function useVideoChat(roomId) {
  const [peers, setPeers] = useState(new Map());
  const { isConnected, sendMessage, addMessageHandler } = useWebSocket(`ws://localhost:3001/room/${roomId}`);

  const handleSdpExchange = useCallback(async (peerId, sdp, type) => {
    sendMessage('sdp', { peerId, sdp, type });
  }, [sendMessage]);

  const handleIceCandidate = useCallback((peerId, candidate) => {
    sendMessage('ice-candidate', { peerId, candidate });
  }, [sendMessage]);

  useEffect(() => {
    const cleanup = [
      addMessageHandler('peer-joined', ({ peerId }) => {
        setPeers(prev => new Map(prev).set(peerId, { connected: false }));
      }),

      addMessageHandler('peer-left', ({ peerId }) => {
        setPeers(prev => {
          const newPeers = new Map(prev);
          newPeers.delete(peerId);
          return newPeers;
        });
      }),

      addMessageHandler('sdp', ({ peerId, sdp, type }) => {
        // Handle SDP exchange
      }),

      addMessageHandler('ice-candidate', ({ peerId, candidate }) => {
        // Handle ICE candidate
      })
    ];

    return () => cleanup.forEach(cleanup => cleanup());
  }, [addMessageHandler]);

  return {
    isConnected,
    peers,
    handleSdpExchange,
    handleIceCandidate
  };
}