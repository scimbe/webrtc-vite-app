import React from 'react';
import { Settings, Lock, Unlock } from 'lucide-react';

export const RoomControls = ({ 
  settings, 
  onUpdateSettings, 
  onKickParticipant 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onUpdateSettings({ isLocked: !settings.isLocked })}
        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
        title={settings.isLocked ? 'Raum entsperren' : 'Raum sperren'}
      >
        {settings.isLocked ? (
          <Lock className="w-5 h-5" />
        ) : (
          <Unlock className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={() => onUpdateSettings({ allowChat: !settings.allowChat })}
        className={`p-2 rounded-lg ${settings.allowChat ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} text-white transition-colors`}
        title={settings.allowChat ? 'Chat deaktivieren' : 'Chat aktivieren'}
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};