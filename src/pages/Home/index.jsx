import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">WebRTC Video Chat</h1>
      <Link to="/room" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Join Room
      </Link>
    </div>
  );
}
