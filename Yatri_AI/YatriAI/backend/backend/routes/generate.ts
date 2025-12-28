import express, { Request, Response, Router } from "express";
import { generateStory } from "../services/gemini.ts";
import { generateAudioFromText } from "../services/googleTTS.ts";

const router: Router = express.Router();

interface GenerateRequest {
  imageBase64: string;
}

interface GenerateResponse {
  story: string;
  audio: string | null;
  audioAvailable: boolean;
  audioError?: string;
}

router.post("/generate", async (req: Request<{}, GenerateResponse, GenerateRequest>, res: Response<GenerateResponse>) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ 
        story: "",
        audio: null,
        audioAvailable: false,
        audioError: "No image data provided" 
      });
    }

    console.log("Generating story for image...");
    const story: string = await generateStory(imageBase64);
    console.log("Story generated successfully");
    
    // Try to generate audio with gTTS
    let audioBase64: string | null = null;
    let audioError: string | undefined = undefined;
    
    try {
      console.log("Converting story to audio using gTTS...");
      audioBase64 = await generateAudioFromText(story);
      console.log("Audio generated successfully");
    } catch (err: any) {
      console.log("gTTS audio generation failed:", err.message);
      audioError = err.message;
    }
    
    res.json({ 
      story,
      audio: audioBase64,
      audioAvailable: !!audioBase64,
      audioError: audioError
    });
  } catch (err: any) {
    console.error("Generation error:", err);
    res.status(500).json({ 
      story: "",
      audio: null,
      audioAvailable: false,
      audioError: err.message || "Generation failed" 
    });
  }
});

export default router;