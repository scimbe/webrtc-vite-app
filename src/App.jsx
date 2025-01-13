import React from 'react';
import { VideoChat } from './components/VideoChat/VideoChat';
import { useMediaStream } from './hooks/useMediaStream';
import { usePeerConnection } from './hooks/usePeerConnection';

function App() {
  const { stream: localStream } = useMediaStream();
  const { peerConnection, remoteStream } = usePeerConnection(localStream);

  return (
    <VideoChat
      peerConnection={peerConnection}
      localStream={localStream}
      remoteStream={remoteStream}
    />
  );
}

export default App;