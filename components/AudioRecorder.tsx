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
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      onDebug('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      onDebug('Microphone access granted.');

      // Use audio/mp4 for iOS compatibility with Whisper
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
        onDebug('Using audio/mp4 format (best for iOS and Whisper)');
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
        onDebug('Using audio/wav format (fallback)');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
        onDebug('Using audio/webm format (fallback)');
      } else {
        onDebug('Using default audio format');
      }
      
      // Clear previous chunks
      chunksRef.current = [];
      
      // Create the recorder
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      // Set up data handler to collect chunks
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          onDebug(`Audio chunk received: ${Math.round(event.data.size / 1024)} KB`);
        }
      };
      
      onDebug(`MediaRecorder initialized with MIME type: ${mediaRecorderRef.current.mimeType}`);
      
      // Request data every second for better handling
      mediaRecorderRef.current.start(1000);
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
    
    // Set up the onstop event handler
    mediaRecorderRef.current.onstop = async () => {
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/mp4';
      onDebug(`Recording finished with MIME type: ${mimeType}`);
      
      // Determine file extension based on mime type
      let fileExt = 'm4a'; // Default to m4a for audio/mp4
      if (mimeType.includes('webm')) fileExt = 'webm';
      if (mimeType.includes('wav')) fileExt = 'wav';
      
      // Create a blob from all the chunks
      const audioBlob = new Blob(chunksRef.current, { type: mimeType });
      onDebug(`Audio blob created, size: ${Math.round(audioBlob.size / 1024)} KB`);
      
      const formData = new FormData();
      formData.append('file', audioBlob, `recording.${fileExt}`);
      
      onDebug(`Sending audio to API as ${fileExt} file...`);
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
    
    // Stop recording - this will trigger the onstop event
    mediaRecorderRef.current.stop();
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