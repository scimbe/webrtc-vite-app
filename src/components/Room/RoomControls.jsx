import React from 'react';
import { Lock, Unlock, UserPlus, UserMinus } from 'lucide-react';

export const RoomControls = ({
  isHost,
  roomStatus,
  onLockRoom,
  onUnlockRoom,
  onKickParticipant,
  className = ''
}) => {
  if (!isHost) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {roomStatus.isLocked ? (
        <button
          onClick={onUnlockRoom}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          title="Raum entsperren"
        >
          <Unlock className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={onLockRoom}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          title="Raum sperren"
        >
          <Lock className="w-5 h-5" />
        </button>
      )}

      <button
        onClick={onKickParticipant}
        className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
        title="Teilnehmer entfernen"
      >
        <UserMinus className="w-5 h-5" />
      </button>
    </div>
  );
}