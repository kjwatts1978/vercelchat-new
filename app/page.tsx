'use client';

import AudioRecorder from '../components/AudioRecorder';
import DebugConsole from '../components/DebugConsole';
import { useState } from 'react';

export default function Home() {
  const [transcription, setTranscription] = useState('');
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  const handleTranscription = (text: string) => {
    setTranscription(text);
  };

  const handleDebug = (message: string) => {
    setDebugMessages(prev => [...prev, message]);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription App</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl mb-4">Record Audio</h2>
        <AudioRecorder 
          onTranscription={handleTranscription} 
          onDebug={handleDebug} 
        />
        
        {transcription && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Transcription Result:</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              {transcription}
            </div>
          </div>
        )}
      </div>
      
      <DebugConsole messages={debugMessages} />
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Note: Make sure your OpenAI API key is properly configured to use this app.</p>
      </div>
    </div>
  );
} 