'use client';

import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  onDebug: (message: string) => void;
}

export default function AudioRecorder({ onTranscription, onDebug }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      onDebug('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      onDebug('Microphone access granted.');

      mediaRecorderRef.current = new MediaRecorder(stream);
      
      onDebug(`MediaRecorder initialized with MIME type: ${mediaRecorderRef.current.mimeType}`);
      
      mediaRecorderRef.current.start();
      onDebug('Recording started.');
      setIsRecording(true);
    } catch (error) {
      onDebug(`Error accessing microphone: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      onDebug('No active recorder found');
      return;
    }
    
    onDebug('Stopping recording...');
    setIsProcessing(true);
    
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.ondataavailable = async (event) => {
      const audioBlob = event.data;
      onDebug(`Recording stopped. Audio data size: ${Math.round(audioBlob.size / 1024)} KB`);
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      onDebug('Sending audio to API for transcription...');
      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        
        onDebug(`API response status: ${response.status}`);
        
        const data = await response.json();
        if (data.text) {
          onDebug(`Transcription received: "${data.text}"`);
          onTranscription(data.text);
        } else if (data.error) {
          onDebug(`Error from API: ${data.error}`);
          console.error('API error:', data.error);
        } else {
          onDebug('No transcription or error returned from API');
          console.error('No transcription returned:', data);
        }
      } catch (error) {
        onDebug(`Error during API call: ${error instanceof Error ? error.message : String(error)}`);
        console.error('Error transcribing audio:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    setIsRecording(false);
    
    // Stop all tracks in the stream
    if (mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        onDebug(`Stopping track: ${track.kind}`);
        track.stop();
      });
    }
  };

  return (
    <div>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`px-4 py-2 rounded ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isProcessing 
          ? 'Processing...' 
          : isRecording 
            ? 'Stop Recording' 
            : 'Start Recording'
        }
      </button>
      {isProcessing && (
        <span className="ml-3 text-gray-600">
          Transcribing audio, please wait...
        </span>
      )}
    </div>
  );
}