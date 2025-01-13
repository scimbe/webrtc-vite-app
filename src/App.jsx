import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoomEntryPage } from './pages/Room/RoomEntryPage';
import { RoomPage } from './pages/Room/RoomPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomEntryPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;