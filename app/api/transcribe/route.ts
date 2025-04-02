import { NextRequest, NextResponse } from 'next/server';
import { transcribeWithWhisper } from '../../../lib/whisper';

export async function POST(request: NextRequest) {
  console.log('Transcription API route called');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log(`Received file: ${file.name}, size: ${Math.round(file.size / 1024)} KB, type: ${file.type}`);
    
    if (file.size === 0) {
      console.error('File is empty');
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }
    
    const transcription = await transcribeWithWhisper(file);
    console.log(`Transcription result: "${transcription}"`);
    
    return NextResponse.json({ text: transcription });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in transcription API:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 