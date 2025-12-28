import axios, { AxiosResponse } from "axios";

interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
}

export async function generateAudioFromText(text: string): Promise<string> {
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

    console.log("Using voice ID:", voiceId);
    console.log("API key length:", apiKey.length);

    const requestBody: ElevenLabsRequest = {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.7,
      },
    };

    const response: AxiosResponse<ArrayBuffer> = await axios.post(
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
    return Buffer.from(response.data).toString("base64");
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
    
    console.error("ElevenLabs Error:", error.response?.status, errorMessage);
    throw new Error(`Audio generation failed: ${errorMessage}`);
  }
}