import React from 'react';
import { Camera, CameraOff, Mic, MicOff, MessageSquare, Share } from 'lucide-react';

export const ControlPanel = ({ 
  localMediaSettings, 
  onMediaSettingsChange, 
  onToggleChat, 
  onToggleInvite, 
  className = '' 
}) => {
  return (
    <div className={`absolute bottom-4 left-0 right-0 flex justify-center space-x-4 ${className}`}>
      <button
        onClick={() => onMediaSettingsChange('video', !localMediaSettings.video)}
        className={`p-4 rounded-full ${localMediaSettings.video ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
        aria-label={localMediaSettings.video ? 'Kamera ausschalten' : 'Kamera einschalten'}
      >
        {localMediaSettings.video ? (
          <Camera className="w-6 h-6 text-white" />
        ) : (
          <CameraOff className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={() => onMediaSettingsChange('audio', !localMediaSettings.audio)}
        className={`p-4 rounded-full ${localMediaSettings.audio ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
        aria-label={localMediaSettings.audio ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
      >
        {localMediaSettings.audio ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={onToggleChat}
        className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
        aria-label="Chat öffnen/schließen"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onToggleInvite}
        className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
        aria-label="Raum teilen"
      >
        <Share className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};