import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoomEntryPage } from './pages/Room/RoomEntryPage.jsx';
import { RoomPage } from './pages/Room/RoomPage.jsx';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<RoomEntryPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;