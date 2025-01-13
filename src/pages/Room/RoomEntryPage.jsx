import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RoomEntryPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomId: '',
    userName: '',
    isNewRoom: true
  });

  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, roomId: randomId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { roomId, userName, isNewRoom } = formData;
    
    if (!roomId.trim() || !userName.trim()) return;

    const path = `/room/${roomId}`;
    const params = new URLSearchParams({
      userName: userName.trim(),
      isHost: isNewRoom ? '1' : '0'
    });

    navigate(`${path}?${params}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-8 shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">
          Video Chat Raum
        </h1>

        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFormData(prev => ({ ...prev, isNewRoom: true }))}
              className={`flex-1 py-2 px-4 rounded-lg ${formData.isNewRoom 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-300'}`}
            >
              Neuer Raum
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, isNewRoom: false }))}
              className={`flex-1 py-2 px-4 rounded-lg ${!formData.isNewRoom 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-300'}`}
            >
              Raum beitreten
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Dein Name
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Name eingeben"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Raum-ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.roomId}
                onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value.toUpperCase() }))}
                className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder={formData.isNewRoom ? "Klicke auf 'Generieren'" : "Raum-ID eingeben"}
                required
                readOnly={formData.isNewRoom}
              />
              {formData.isNewRoom && (
                <button
                  type="button"
                  onClick={generateRoomId}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                >
                  Generieren
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 mt-6"
          >
            {formData.isNewRoom ? 'Raum erstellen' : 'Raum beitreten'}
          </button>
        </form>
      </div>
    </div>
  );
};