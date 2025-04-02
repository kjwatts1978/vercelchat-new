import { NextRequest, NextResponse } from 'next/server';
import { transcribeWithWhisper } from '../../../lib/whisper';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const transcription = await transcribeWithWhisper(file);
    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error('Error in transcription API:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
} 