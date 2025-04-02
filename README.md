# Audio Transcription App

This is a Next.js application that allows you to record audio, transcribe it using OpenAI's Whisper API, and display the transcription.

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Audio recording using the browser's MediaRecorder API
- Transcription using OpenAI's Whisper API
- Real-time display of transcription results

## Deployment on Vercel

The easiest way to deploy this app is using Vercel:

1. Push the repository to GitHub, GitLab, or Bitbucket
2. Import the repository into Vercel
3. Add your `OPENAI_API_KEY` in the Vercel dashboard under **Settings > Environment Variables**
4. Deploy! 