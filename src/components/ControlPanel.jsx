import React from 'react';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';

export const ControlPanel = ({ 
  settings, 
  onToggleVideo, 
  onToggleAudio, 
  className = '' 
}) => {
  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full ${settings.video ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
        aria-label={settings.video ? 'Kamera ausschalten' : 'Kamera einschalten'}
      >
        {settings.video ? (
          <Camera className="w-6 h-6 text-white" />
        ) : (
          <CameraOff className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full ${settings.audio ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
        aria-label={settings.audio ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
      >
        {settings.audio ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};