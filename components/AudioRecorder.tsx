'use client';

import { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  onDebug: (message: string) => void;
}

export default function AudioRecorder({ onTranscription, onDebug }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      onDebug('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      onDebug('Microphone access granted.');

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav', // WAV is reliable for iOS and Whisper
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // Mono to reduce file size
        desiredSampRate: 16000, // Matches Whisper's recommended sample rate
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      onDebug('Recording started with audio/wav format.');
      setIsRecording(true);
    } catch (error) {
      onDebug(`Error accessing microphone: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) {
      onDebug('No active recorder found');
      return;
    }

    onDebug('Stopping recording...');
    setIsProcessing(true);

    recorderRef.current.stopRecording(async () => {
      const audioBlob = recorderRef.current!.getBlob();
      onDebug(`Audio blob created, size: ${Math.round(audioBlob.size / 1024)} KB`);

      // Create a downloadable URL
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      onDebug('Sending audio to API as WAV file...');
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

      // Clean up the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          onDebug(`Stopping track: ${track.kind}`);
          track.stop();
        });
        streamRef.current = null;
      }
    });

    setIsRecording(false);
  };

  return (
    <div className="space-y-4">
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
            : 'Start Recording'}
        </button>
        {isProcessing && (
          <span className="ml-3 text-gray-600">
            Transcribing audio, please wait...
          </span>
        )}
      </div>
      {audioUrl && (
        <div>
          <a
            href={audioUrl}
            download="recording.wav"
            className="text-blue-500 hover:underline"
          >
            Download Recorded Audio (WAV)
          </a>
        </div>
      )}
    </div>
  );
}