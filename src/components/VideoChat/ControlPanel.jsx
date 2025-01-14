import React from 'react';
import { Camera, CameraOff, Mic, MicOff, X } from 'lucide-react';

export const ControlPanel = ({
  isMuted = false,
  isVideoOff = false,
  onToggleMute,
  onToggleVideo,
  onLeave,
  isHost,
  participants,
  connectionState,
  className = ''
}) => {
  const buttonClass = `p-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 bg-opacity-90 p-4">
      <div className={`max-w-7xl mx-auto flex justify-center space-x-4 ${className}`}>
        <button
          onClick={onToggleVideo}
          className={`${buttonClass} ${!isVideoOff ? 'bg-slate-600 hover:bg-slate-700' : 'bg-red-500 hover:bg-red-600'}`}
          aria-label={isVideoOff ? 'Video aktivieren' : 'Video deaktivieren'}
        >
          {!isVideoOff ? (
            <Camera className="w-6 h-6 text-white" />
          ) : (
            <CameraOff className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={onToggleMute}
          className={`${buttonClass} ${!isMuted ? 'bg-slate-600 hover:bg-slate-700' : 'bg-red-500 hover:bg-red-600'}`}
          aria-label={isMuted ? 'Mikrofon aktivieren' : 'Mikrofon deaktivieren'}
        >
          {!isMuted ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={onLeave}
          className={`${buttonClass} bg-red-500 hover:bg-red-600`}
          aria-label="Anruf beenden"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Connection Status */}
      {connectionState !== 'connected' && (
        <div className="text-center text-white mt-2">
          {connectionState === 'connecting' ? 'Verbindung wird hergestellt...' : 'Verbindung unterbrochen'}
        </div>
      )}
    </div>
  );
};