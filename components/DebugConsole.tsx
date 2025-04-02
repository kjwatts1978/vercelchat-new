'use client';

import { useEffect, useRef } from 'react';

interface DebugConsoleProps {
  messages: string[];
}

export default function DebugConsole({ messages }: DebugConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Debug Console</h2>
      <div 
        ref={consoleRef}
        className="bg-gray-900 text-green-400 font-mono p-4 rounded-md h-60 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500">No debug messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span> {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 