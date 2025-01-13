import { useState, useEffect, useCallback } from 'react';
import { useIceManagement } from './useIceManagement';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceTransportPolicy: 'all',
  iceCandidatePoolSize: 10
};

export function usePeerConnection(localStream, onIceCandidate) {
  const [peerConnection, setPeerConnection] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new');
  
  const { addIceCandidate } = useIceManagement(peerConnection, onIceCandidate);

  useEffect(() => {
    const pc = new RTCPeerConnection(configuration);
    pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
    
    pc.ontrack = (event) => {
      const [track] = event.streams;
      setRemoteStream(track);
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

  const createOffer = useCallback(async () => {
    if (!peerConnection) return null;

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }, [peerConnection]);

  const handleAnswer = useCallback(async (answer) => {
    if (!peerConnection) return false;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      return true;
    } catch (error) {
      console.error('Error handling answer:', error);
      return false;
    }
  }, [peerConnection]);

  const handleOffer = useCallback(async (offer) => {
    if (!peerConnection) return null;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error handling offer:', error);
      return null;
    }
  }, [peerConnection]);

  return {
    peerConnection,
    remoteStream,
    connectionState,
    createOffer,
    handleAnswer,
    handleOffer,
    addIceCandidate
  };
}