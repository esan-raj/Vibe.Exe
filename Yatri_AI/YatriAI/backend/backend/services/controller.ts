import { Request, Response } from "express";
import { generateStory } from "./gemini.ts";
import { generateAudioFromText } from "./elevenlabs.ts";

interface NarrationRequest {
  imageBase64: string;
}

interface NarrationResponse {
  script: string;
  audio: string;
}

interface ErrorResponse {
  error: string;
}

export async function generateNarration(
  req: Request<{}, NarrationResponse | ErrorResponse, NarrationRequest>, 
  res: Response<NarrationResponse | ErrorResponse>
): Promise<void> {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "No image data provided" });
      return;
    }

    console.log("Generating script from image...");
    const script: string = await generateStory(imageBase64);
    console.log("Script generated successfully");

    console.log("Generating audio from script...");
    const audio: string = await generateAudioFromText(script);
    console.log("Audio generated successfully");

    res.json({ script, audio });
  } catch (err: any) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: err.message || "AI generation failed" });
  }
}