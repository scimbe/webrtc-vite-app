import { useState, useEffect, useCallback } from 'react';
import { webrtcConfig } from '../config/webrtc';

export function usePeerConnection(localStream) {
  const [peerConnection, setPeerConnection] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new');

  useEffect(() => {
    const pc = new RTCPeerConnection(webrtcConfig);

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    setPeerConnection(pc);

    return () => {
      pc.close();
    };
  }, [localStream]);

  return {
    peerConnection,
    remoteStream,
    connectionState
  };
}