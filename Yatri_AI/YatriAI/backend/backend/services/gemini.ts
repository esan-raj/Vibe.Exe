import axios, { AxiosResponse } from "axios";

interface GeminiCandidate {
  content: {
    parts: Array<{
      text: string;
    }>;
  };
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

export async function generateStory(imageBase64: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    if (!imageBase64) {
      throw new Error("No image data provided");
    }

    const prompt: string = `
Identify the historic monument in this image.
Write a clear, engaging historical story (150–200 words)
covering its history, architecture, and cultural importance.
`;

    // Remove data URL prefix if present
    const cleanBase64: string = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    console.log("Using Gemini 2.5 Flash model for story generation");

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: cleanBase64,
              },
            },
          ],
        },
      ],
    };

    const response: AxiosResponse<GeminiResponse> = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error("Empty response from Gemini API");
    }

    const generatedText: string = response.data.candidates[0].content.parts[0].text;
    console.log("Story generated successfully with Gemini 2.5 Flash");
    return generatedText;
  } catch (error: any) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error(`AI generation failed: ${error.response?.data?.error?.message || error.message}`);
  }
}