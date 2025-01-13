import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, Mic, MicOff, Settings, Share, Users } from 'lucide-react';
import { VideoStream } from './VideoStream';
import { ControlPanel } from './ControlPanel';
import { ConnectionStatus } from '../Status/ConnectionStatus';

export const VideoChat = ({ peerConnection, localStream, remoteStream }) => {
  const [settings, setSettings] = useState({
    video: true,
    audio: true,
    sharing: false,
    layout: 'grid'
  });

  const [participants, setParticipants] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !settings.video;
      });
      setSettings(prev => ({ ...prev, video: !prev.video }));
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !settings.audio;
      });
      setSettings(prev => ({ ...prev, audio: !prev.audio }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto p-4">
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-4">
          <ConnectionStatus connected={!!peerConnection} />
          <div className="flex items-center space-x-2">
            <Users className="text-white" />
            <span className="text-white">{participants.length + 1}</span>
          </div>
        </div>

        {/* Video Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-4`}>
          {/* Remote Stream */}
          <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-xl">
            {remoteStream ? (
              <VideoStream stream={remoteStream} isMuted={false} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                Waiting for connection...
              </div>
            )}
          </div>

          {/* Local Stream */}
          <div className={`relative aspect-video ${isMobile ? 'hidden' : ''}`}>
            <div className="absolute inset-0 bg-slate-800 rounded-lg overflow-hidden shadow-xl">
              {localStream && (
                <VideoStream stream={localStream} isMuted={true} isLocal={true} />
              )}
            </div>
          </div>

          {/* Mobile Picture-in-Picture */}
          {isMobile && localStream && (
            <div className="absolute top-4 right-4 w-32 h-32 rounded-lg overflow-hidden shadow-xl">
              <VideoStream stream={localStream} isMuted={true} isLocal={true} />
            </div>
          )}
        </div>

        {/* Control Panel */}
        <ControlPanel
          settings={settings}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent py-4"
        />
      </div>
    </div>
  );
};