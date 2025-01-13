import React, { useCallback } from 'react';
import { VideoStream } from './VideoStream';
import { Controls } from './Controls';
import { ChatBox } from '../Chat/ChatBox';
import { ConnectionStatus } from '../ConnectionStatus';
import { useMediaStream } from '../../hooks/useMediaStream';
import { usePeerConnection } from '../../hooks/usePeerConnection';
import { useDataChannel } from '../../hooks/useDataChannel';
import { useConnectionState } from '../../hooks/useConnectionState';
import { useReconnection } from '../../hooks/useReconnection';

export const VideoChat = () => {
  const { stream, error: mediaError } = useMediaStream();
  const {
    peerConnection,
    remoteStream,
    createOffer,
    handleAnswer,
    handleOffer,
    resetConnection
  } = usePeerConnection(stream);

  const connectionState = useConnectionState(peerConnection);
  const { messages, isOpen, sendMessage } = useDataChannel(peerConnection);

  const handleReconnect = useCallback(() => {
    resetConnection();
    // Hier könnte weitere Reconnect-Logik implementiert werden
  }, [resetConnection]);

  const { canReconnect } = useReconnection({
    isConnected: connectionState.status === 'connected',
    reconnectAttempts: connectionState.reconnectAttempts,
    onReconnect: handleReconnect
  });

  if (mediaError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-lg max-w-md">
          <h2 className="text-lg font-bold mb-2">Medienzugriff fehlgeschlagen</h2>
          <p>{mediaError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ConnectionStatus
        status={connectionState.status}
        error={connectionState.error}
        onRetry={handleReconnect}
        canReconnect={canReconnect}
      />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4">
                {remoteStream ? (
                  <VideoStream stream={remoteStream} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {connectionState.status === 'connecting' ? 'Verbindung wird hergestellt...' : 'Warte auf Verbindung...'}
                  </div>
                )}
              </div>

              <div className="absolute top-4 right-4">
                {stream && <VideoStream stream={stream} isMuted isLocal />}
              </div>

              <Controls />
            </div>
          </div>

          <div className="lg:col-span-1 h-[calc(100vh-2rem)]">
            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              isOpen={isOpen}
              connectionStatus={connectionState.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};