import { useState, useEffect, useCallback } from 'react';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function usePeerConnection(localStream) {
  const [peerConnection, setPeerConnection] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new');

  useEffect(() => {
    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        // TODO: Send candidate to signaling server
        console.log('New ICE candidate:', candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(new MediaStream([event.track]));
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    return () => {
      pc.close();
    };
  }, [localStream]);

  const createOffer = useCallback(async () => {
    if (!peerConnection) return null;

    try {
      const offer = await peerConnection.createOffer();
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

  const addIceCandidate = useCallback(async (candidate) => {
    if (!peerConnection) return false;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      return true;
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      return false;
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