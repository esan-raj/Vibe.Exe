import axios from "axios";
// @ts-ignore - gtts doesn't have TypeScript definitions
import gtts from "gtts";

export async function generateAudioFromText(text: string): Promise<string> {
  try {
    console.log("🎵 Using Google Text-to-Speech REST API");

    // Use Google's free TTS API (no authentication required for basic usage)
    const response = await axios.post(
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
    const audioBase64: string = Buffer.from(response.data as ArrayBuffer).toString('base64');
    console.log("✅ Google TTS audio generated successfully");
    return audioBase64;
  } catch (error: any) {
    console.error("❌ Google TTS Error:", error.message);
    
    // Fallback: Try gTTS library
    try {
      console.log("🔄 Trying gTTS library...");
      const audioBase64 = await generateAudioWithGTTS(text);
      return audioBase64;
    } catch (gttsError: any) {
      console.error("❌ gTTS also failed:", gttsError.message);
    }
    
    // Final fallback: Try VoiceRSS demo API
    try {
      console.log("🔄 Trying VoiceRSS demo API...");
      
      const fallbackResponse = await axios.get(
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
        const audioBase64: string = Buffer.from(fallbackResponse.data as ArrayBuffer).toString('base64');
        console.log("✅ Fallback TTS audio generated successfully");
        return audioBase64;
      }
    } catch (fallbackError: any) {
      console.error("❌ Fallback TTS also failed:", fallbackError.message);
    }
    
    throw new Error(`Audio generation failed: ${error.message}`);
  }
}

// gTTS library service (additional option)
export async function generateAudioWithGTTS(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log("🎵 Using gTTS library for audio generation");
      
      const tts = new gtts(text, 'en');
      
      // Create a buffer to collect audio data
      const chunks: Buffer[] = [];
      
      const stream = tts.stream();
      
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      stream.on('end', () => {
        const audioBuffer = Buffer.concat(chunks);
        const audioBase64 = audioBuffer.toString('base64');
        console.log("✅ gTTS audio generated successfully");
        resolve(audioBase64);
      });
      
      stream.on('error', (error: Error) => {
        console.error("❌ gTTS Error:", error.message);
        reject(new Error(`gTTS audio generation failed: ${error.message}`));
      });
      
    } catch (error: any) {
      console.error("❌ gTTS Setup Error:", error.message);
      reject(new Error(`gTTS setup failed: ${error.message}`));
    }
  });
}

// ElevenLabs service for premium audio (optional)
interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
}

export async function generateAudioWithElevenLabs(text: string): Promise<string> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not found in environment variables");
    }

    if (!process.env.VOICE_ID) {
      throw new Error("VOICE_ID not found in environment variables");
    }

    // Clean the API key (remove quotes if present)
    const apiKey: string = process.env.ELEVENLABS_API_KEY.replace(/"/g, '');
    const voiceId: string = process.env.VOICE_ID.replace(/"/g, '');

    console.log("🎵 Using ElevenLabs TTS with voice ID:", voiceId);

    const requestBody: ElevenLabsRequest = {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.7,
      },
    };

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      requestBody,
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Convert audio buffer to base64
    const audioBase64 = Buffer.from(response.data as ArrayBuffer).toString("base64");
    console.log("✅ ElevenLabs audio generated successfully");
    return audioBase64;
  } catch (error: any) {
    // Parse the buffer error message
    let errorMessage: string = "Unknown error";
    if (error.response?.data) {
      try {
        const errorText: string = Buffer.from(error.response.data).toString('utf8');
        const errorObj = JSON.parse(errorText);
        errorMessage = errorObj.detail?.status || errorObj.detail?.message || errorText;
        console.error("ElevenLabs Error Details:", errorObj);
      } catch (parseError) {
        console.error("ElevenLabs Error (raw):", error.response.data);
      }
    }
    
    console.error("❌ ElevenLabs Error:", error.response?.status, errorMessage);
    throw new Error(`ElevenLabs audio generation failed: ${errorMessage}`);
  }
}