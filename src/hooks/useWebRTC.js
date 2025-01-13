import { useState, useEffect } from 'react';

export const useWebRTC = () => {
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    return () => {
      pc.close();
    };
  }, []);

  return { peerConnection };
};
