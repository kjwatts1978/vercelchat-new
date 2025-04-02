'use client';

import { useState, useRef, useEffect } from 'react';
import RecordRTC from 'recordrtc';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  onDebug: (message: string) => void;
}

export default function AudioRecorder({ onTranscription, onDebug }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect for tracking recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (!isProcessing) {
        setRecordingTime(0);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isProcessing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    <div className="space-y-6">
      {/* Recording timer */}
      <div className="w-full flex justify-center items-center">
        <div className={`font-mono text-3xl font-bold ${
          isRecording ? 'text-neo-pink' : 'text-neo-black'
        }`}>
          {formatTime(recordingTime)}
          {isRecording && <span className="ml-2 text-neo-pink animate-pulse">●</span>}
        </div>
      </div>

      {/* Main recording button with neo-brutalism style */}
      <div className="flex flex-col items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-48 h-48 rounded-full
            font-neo text-2xl uppercase
            border-4 border-neo-black
            flex items-center justify-center
            transition-all duration-150
            ${
              isProcessing 
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-70' 
                : isRecording 
                  ? 'bg-neo-pink text-white shadow-neo-md hover:translate-x-1 hover:translate-y-1 hover:shadow-none' 
                  : 'bg-neo-yellow text-neo-black shadow-neo-md hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
            }
          `}
        >
          {isProcessing 
            ? 'Processing...' 
            : isRecording 
              ? 'STOP' 
              : 'START'
          }
        </button>
        
        {isProcessing && (
          <div className="mt-4 font-neo text-lg text-neo-black border-l-4 border-neo-pink pl-3">
            Transcribing audio...
          </div>
        )}
      </div>

      {/* Download option */}
      {audioUrl && (
        <div className="mt-6 text-center">
          <a
            href={audioUrl}
            download="recording.wav"
            className="inline-block bg-neo-blue text-neo-black font-neo py-2 px-6 border-4 border-neo-black shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            DOWNLOAD AUDIO
          </a>
        </div>
      )}
    </div>
  );
}