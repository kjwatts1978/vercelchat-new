'use client';

import AudioRecorder from '../components/AudioRecorder';
import { useState } from 'react';

export default function Home() {
  const [transcription, setTranscription] = useState('');

  const handleTranscription = (text: string) => {
    setTranscription(text);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription App</h1>
      <AudioRecorder onTranscription={handleTranscription} />
      {transcription && (
        <p className="mt-4">Transcription: {transcription}</p>
      )}
    </div>
  );
} 