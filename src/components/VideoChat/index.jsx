import React, { useState } from 'react';
import { VideoStream } from './VideoStream';
import { Controls } from './Controls';
import { ChatBox } from '../Chat/ChatBox';
import { useMediaStream } from '../../hooks/useMediaStream';
import { usePeerConnection } from '../../hooks/usePeerConnection';
import { useDataChannel } from '../../hooks/useDataChannel';

export const VideoChat = () => {
  const [showChat, setShowChat] = useState(false);
  const { stream, error: mediaError } = useMediaStream();
  const {
    peerConnection,
    remoteStream,
    connectionState,
    // ... andere props
  } = usePeerConnection(stream);

  const { messages, isOpen, sendMessage } = useDataChannel(peerConnection);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Remote Stream */}
              <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4">
                {remoteStream ? (
                  <VideoStream stream={remoteStream} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Waiting for connection...
                  </div>
                )}
              </div>

              {/* Local Stream (Picture-in-Picture) */}
              <div className="absolute top-4 right-4">
                {stream && <VideoStream stream={stream} isMuted isLocal />}
              </div>

              <Controls />
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1 h-[calc(100vh-2rem)]">
            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              isOpen={isOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};