import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audio Transcription App',
  description: 'Record audio and transcribe it with OpenAI Whisper',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 