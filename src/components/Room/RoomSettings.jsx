import React, { useState } from 'react';
import { Settings } from 'lucide-react';

export const RoomSettings = ({ roomStatus, onUpdateSettings, isHost }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(roomStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings(settings);
    setIsOpen(false);
  };

  if (!isHost) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl p-4 z-50">
          <h3 className="text-white font-medium mb-4">Raum-Einstellungen</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Max. Teilnehmer
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={settings.maxParticipants}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  maxParticipants: parseInt(e.target.value)
                }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
            >
              Speichern
            </button>
          </form>
        </div>
      )}
    </div>
  );
}