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
  
  // Check file extension and type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  console.log(`File extension: ${fileExtension}, MIME type: ${file.type}`);
  
  // Validate file format (Whisper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm)
  const supportedFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg'];
  if (fileExtension && !supportedFormats.includes(fileExtension)) {
    console.error(`Unsupported file extension: ${fileExtension}`);
    throw new Error(`Unsupported audio format: ${fileExtension}. Supported formats are: ${supportedFormats.join(', ')}`);
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
      // Extract useful info from error message
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('api key')) {
        throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
      }
      
      if (errorMsg.includes('format') || errorMsg.includes('unsupported')) {
        throw new Error('Unsupported audio format. Please use one of these formats: mp3, mp4, mpeg, m4a, wav, or webm.');
      }
      
      if (errorMsg.includes('too large') || errorMsg.includes('size')) {
        throw new Error('Audio file is too large. Please limit your recording to 25MB or less.');
      }
      
      if (errorMsg.includes('no speech')) {
        throw new Error('No speech detected in the audio. Please speak clearly and try again.');
      }
      
      throw error;
    }
    
    // Generic error
    throw new Error('Failed to transcribe audio with OpenAI Whisper API');
  }
} 