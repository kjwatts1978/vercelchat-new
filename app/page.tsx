'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import both AudioRecorder and DebugConsole with SSR disabled
const AudioRecorder = dynamic(() => import('../components/AudioRecorder'), {
  ssr: false,
});
const DebugConsole = dynamic(() => import('../components/DebugConsole'), {
  ssr: false,
});

export default function Home() {
  const [transcription, setTranscription] = useState('');
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  const handleTranscription = (text: string) => {
    setTranscription(text);
  };

  const handleDebug = (message: string) => {
    setDebugMessages((prev) => [...prev, message]);
  };

  return (
    <div className="p-6 lg:p-12 min-h-screen flex flex-col bg-neo-yellow relative">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 h-20 w-20 rounded-full bg-neo-pink border-4 border-neo-black hidden md:block"></div>
      <div className="absolute bottom-20 left-20 h-32 w-32 bg-neo-blue border-4 border-neo-black rotate-12 hidden md:block"></div>

      <div className="max-w-5xl mx-auto w-full">
        {/* Title */}
        <div className="mb-12 mt-6 relative">
          <h1 className="font-neo text-7xl text-neo-black tracking-wide uppercase ml-4 relative z-10">
            Audio Transcription
          </h1>
          <div className="h-8 bg-neo-pink absolute bottom-1 left-0 w-3/4 -z-10 border-4 border-neo-black"></div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 transform md:translate-y-6 mb-8">
            <div className="bg-white border-4 border-neo-black p-6 shadow-neo-lg">
              <h2 className="font-neo text-3xl mb-6 text-center text-neo-black uppercase">
                Record Audio
              </h2>
              <div className="flex justify-center mb-4">
                <AudioRecorder onTranscription={handleTranscription} onDebug={handleDebug} />
              </div>
            </div>
          </div>

          <div className="md:col-span-1 md:translate-y-0">
            <div className="bg-neo-blue border-4 border-neo-black p-6 shadow-neo-md">
              <h2 className="font-neo text-xl mb-2 text-neo-black uppercase">How it works</h2>
              <p className="text-neo-black font-bold">1. Click the recording button</p>
              <p className="text-neo-black font-bold">2. Speak clearly into your microphone</p>
              <p className="text-neo-black font-bold">3. Stop recording when finished</p>
              <p className="text-neo-black font-bold">4. Wait for transcription results</p>
            </div>
          </div>
        </div>

        {/* Transcription result */}
        {transcription && (
          <div className="mt-8">
            <div className="bg-neo-green border-4 border-neo-black p-6 shadow-neo-lg transform -rotate-1">
              <h2 className="font-neo text-3xl mb-4 text-neo-black uppercase">
                Transcription Result
              </h2>
              <p className="text-neo-black text-lg font-bold bg-white p-4 border-2 border-neo-black">
                {transcription}
              </p>
            </div>
          </div>
        )}

        {/* Debug console */}
        <div className="mt-12">
          <DebugConsole messages={debugMessages} />
        </div>
      </div>
    </div>
  );
}