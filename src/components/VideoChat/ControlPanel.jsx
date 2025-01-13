import React from 'react';
import { Camera, CameraOff, Mic, MicOff, Settings, Share, X } from 'lucide-react';

export const ControlPanel = ({
  settings,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  className = ''
}) => {
  const buttonClass = `p-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`;

  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      <button
        onClick={onToggleVideo}
        className={`${buttonClass} ${settings.video ? 'bg-slate-600 hover:bg-slate-700' : 'bg-red-500 hover:bg-red-600'}`}
        aria-label={settings.video ? 'Disable video' : 'Enable video'}
      >
        {settings.video ? (
          <Camera className="w-6 h-6 text-white" />
        ) : (
          <CameraOff className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={onToggleAudio}
        className={`${buttonClass} ${settings.audio ? 'bg-slate-600 hover:bg-slate-700' : 'bg-red-500 hover:bg-red-600'}`}
        aria-label={settings.audio ? 'Disable audio' : 'Enable audio'}
      >
        {settings.audio ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={onEndCall}
        className={`${buttonClass} bg-red-500 hover:bg-red-600`}
        aria-label="End call"
      >
        <X className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};