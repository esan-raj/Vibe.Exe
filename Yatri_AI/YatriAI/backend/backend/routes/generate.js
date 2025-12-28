import express from "express";
import { generateStory } from "../services/gemini.js";
import { generateAudioFromText } from "../services/googleTTS.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: "No image data provided" });
    }

    console.log("Generating story for image...");
    const story = await generateStory(imageBase64);
    console.log("Story generated successfully");
    
    // Try to generate audio with gTTS
    let audioBase64 = null;
    let audioError = null;
    
    try {
      console.log("Converting story to audio using gTTS...");
      audioBase64 = await generateAudioFromText(story);
      console.log("Audio generated successfully");
    } catch (err) {
      console.log("gTTS audio generation failed:", err.message);
      audioError = err.message;
    }
    
    res.json({ 
      story,
      audio: audioBase64,
      audioAvailable: !!audioBase64,
      audioError: audioError
    });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: err.message || "Generation failed" });
  }
});

export default router;
