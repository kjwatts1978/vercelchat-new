import OpenAI from 'openai';

export async function transcribeWithWhisper(file: File): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }
  const openai = new OpenAI({ apiKey });
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });
  return response.text;
} 