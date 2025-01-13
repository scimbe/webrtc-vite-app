import React from 'react';
import { LocalStream } from '../../components/LocalStream';

export default function Room() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Video Room</h1>
      <LocalStream />
    </div>
  );
}