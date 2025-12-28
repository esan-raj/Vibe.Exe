import axios, { AxiosResponse } from "axios";

export async function generateAudioFromText(text: string): Promise<string> {
  try {
    console.log("Using Google Text-to-Speech REST API");

    // Use Google's free TTS API (no authentication required for basic usage)
    const response: AxiosResponse<ArrayBuffer> = await axios.post(
      'https://translate.google.com/translate_tts',
      null,
      {
        params: {
          ie: 'UTF-8',
          q: text,
          tl: 'en',
          client: 'tw-ob',
          textlen: text.length
        },
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.data) {
      throw new Error("No audio data received from Google TTS");
    }

    // Convert audio buffer to base64
    const audioBase64: string = Buffer.from(response.data).toString('base64');
    console.log("Google TTS audio generated successfully");
    return audioBase64;
  } catch (error: any) {
    console.error("Google TTS Error:", error.message);
    
    // Fallback: Try a different approach with a simpler API
    try {
      console.log("Trying alternative TTS approach...");
      
      const fallbackResponse: AxiosResponse<ArrayBuffer> = await axios.get(
        'https://api.voicerss.org/',
        {
          params: {
            key: 'demo', // Demo key for testing
            src: text.substring(0, 100), // Limit text length for demo
            hl: 'en-us',
            f: '44khz_16bit_mono',
            c: 'mp3'
          },
          responseType: 'arraybuffer'
        }
      );
      
      if (fallbackResponse.data) {
        const audioBase64: string = Buffer.from(fallbackResponse.data).toString('base64');
        console.log("Fallback TTS audio generated successfully");
        return audioBase64;
      }
    } catch (fallbackError: any) {
      console.error("Fallback TTS also failed:", fallbackError.message);
    }
    
    throw new Error(`Audio generation failed: ${error.message}`);
  }
}