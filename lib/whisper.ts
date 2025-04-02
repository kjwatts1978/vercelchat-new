import OpenAI from 'openai';

export async function transcribeWithWhisper(file: File): Promise<string> {
  console.log('Starting transcription with Whisper API');
  
  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not found in environment variables');
  }
  
  // Validate file
  if (file.size === 0) {
    console.error('File is empty');
    throw new Error('Cannot transcribe empty file');
  }
  
  try {
    console.log(`Initializing OpenAI client for file: ${file.name}`);
    const openai = new OpenAI({ apiKey });
    
    console.log('Sending file to OpenAI Whisper API...');
    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });
    
    console.log('Transcription completed successfully');
    return response.text;
  } catch (error) {
    console.error('OpenAI Whisper API error:', error);
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
      }
      if (error.message.includes('file format')) {
        throw new Error('Unsupported audio format. Please use a supported audio format.');
      }
      throw error;
    }
    
    // Generic error
    throw new Error('Failed to transcribe audio with OpenAI Whisper API');
  }
} 