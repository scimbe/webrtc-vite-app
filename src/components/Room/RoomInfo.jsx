import React from 'react';
import { Users } from 'lucide-react';

export const RoomInfo = ({ roomId, participants, connectionStatus }) => {
  return (
    <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
      <div>
        <p className="text-slate-400 text-sm">Raum-ID</p>
        <p className="text-white font-medium">{roomId}</p>
      </div>

      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-slate-400" />
        <span className="text-white">{participants.length}</span>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${{
            'connected': 'bg-green-500',
            'connecting': 'bg-yellow-500 animate-pulse',
            'disconnected': 'bg-red-500',
            'error': 'bg-red-500'
          }[connectionStatus] || 'bg-gray-500'}`}
        />
        <span className="text-slate-300 text-sm">
          {{
            'connected': 'Verbunden',
            'connecting': 'Verbinde...',
            'disconnected': 'Getrennt',
            'error': 'Fehler'
          }[connectionStatus] || 'Unbekannt'}
        </span>
      </div>
    </div>
  );
};