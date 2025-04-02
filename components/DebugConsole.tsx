'use client';

import { useEffect, useRef, useState } from 'react';

interface DebugConsoleProps {
  messages: string[];
}

export default function DebugConsole({ messages }: DebugConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (consoleRef.current && isOpen) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <div className="mb-10">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="font-neo text-xl uppercase bg-neo-black text-white py-2 px-4 border-4 border-neo-black shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          {isOpen ? 'Hide Debug Console' : 'Show Debug Console'}
        </button>
        
        {isOpen && (
          <div className="mt-2 border-4 border-neo-black shadow-neo-md overflow-hidden">
            <div className="bg-neo-black text-white font-neo text-xl py-2 px-4 uppercase flex justify-between items-center">
              <span>Debug Console</span>
              <span className="text-neo-pink">● REC</span>
            </div>
            
            <div 
              ref={consoleRef}
              className="bg-black text-neo-green font-mono p-4 h-60 overflow-y-auto border-t-4 border-neo-black"
            >
              {messages.length === 0 ? (
                <p className="text-gray-500">No debug messages yet...</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-neo-pink font-bold">[{new Date().toLocaleTimeString()}]</span>{' '}
                    <span className="text-neo-green">{msg}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="bg-neo-black py-1 px-4 flex justify-between items-center border-t-4 border-neo-black">
              <span className="text-white font-mono text-sm">{messages.length} log entries</span>
              <span className="text-neo-green font-mono text-sm">system:ready</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 