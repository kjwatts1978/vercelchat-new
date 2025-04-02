'use client';

import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
}

export default function AudioRecorder({ onTranscription }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.ondataavailable = async (event) => {
      const audioBlob = event.data;
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.text) {
          onTranscription(data.text);
        } else {
          console.error('No transcription returned:', data);
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    };
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </button>
  );
} 