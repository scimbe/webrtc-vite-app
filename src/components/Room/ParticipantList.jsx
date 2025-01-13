import React from 'react';
import { User } from 'lucide-react';

export const ParticipantList = ({ participants, onKickParticipant, isHost }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-24rem)]">
      <h3 className="text-white font-medium mb-4">Teilnehmer ({participants.length})</h3>
      
      {participants.length === 0 ? (
        <p className="text-slate-400 text-sm">Noch keine Teilnehmer</p>
      ) : (
        <ul className="space-y-2">
          {participants.map((participant) => (
            <li 
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700"
            >
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-slate-400" />
                <span className="text-white">{participant.name}</span>
                {participant.isHost && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Host
                  </span>
                )}
              </div>

              {isHost && !participant.isHost && (
                <button
                  onClick={() => onKickParticipant(participant.id)}
                  className="text-red-400 hover:text-red-300 p-1 rounded-lg"
                  title="Teilnehmer entfernen"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}