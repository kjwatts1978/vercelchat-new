'use client';

import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
}

export default function AudioRecorder({ onTranscription }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // To manage the stream

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Use mp4 format for iOS compatibility
      const options = { mimeType: 'audio/mp4' };
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } else {
        // Fallback to default if mp4 isn't supported (unlikely on iOS)
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp4' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.m4a'); // Use .m4a for Whisper compatibility

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

        // Clean up the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
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