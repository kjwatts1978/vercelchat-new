import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';

// Import Google Font - Bebas Neue for headings
const bebasNeue = fetch(
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'
).then((res) => res.text());

// Montserrat font for body text
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Neo Brutalist Audio Transcription',
  description: 'Record audio and transcribe it with OpenAI Whisper',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${montserrat.variable} font-neo-body bg-white`}>
        {children}
      </body>
    </html>
  );
} 