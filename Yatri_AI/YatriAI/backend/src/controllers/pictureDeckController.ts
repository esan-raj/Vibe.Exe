import { Request, Response } from 'express';
import multer from 'multer';
import { generateMonumentStory } from '../services/geminiService.js';
import { generateAudioFromText, generateAudioWithElevenLabs, generateAudioWithGTTS } from '../services/ttsService.js';

// Configure multer for image uploads (keeping for compatibility)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

export const uploadMiddleware = upload.single('image');

interface MonumentStory {
  story: string;
  audio: string | null;
  audioAvailable: boolean;
  audioError?: string;
  imageSize: number;
  imageType: string;
  timestamp: string;
}

// Main controller function - supports both file upload and base64
export const analyzeMonument = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Starting monument analysis...');
    
    let imageBase64: string;
    let imageSize = 0;
    let imageType = 'image/jpeg';
    
    // Handle both file upload and base64 input
    if (req.file) {
      // File upload method
      console.log('📸 Processing uploaded file:', {
        size: req.file.size,
        type: req.file.mimetype,
        originalName: req.file.originalname
      });
      imageBase64 = req.file.buffer.toString('base64');
      imageSize = req.file.size;
      imageType = req.file.mimetype;
    } else if (req.body.imageBase64) {
      // Base64 method (from frontend)
      console.log('📸 Processing base64 image data');
      imageBase64 = req.body.imageBase64;
      // Estimate size from base64 length (rough approximation)
      imageSize = Math.round((imageBase64.length * 3) / 4);
    } else {
      console.error('❌ No image data provided');
      return res.status(400).json({
        success: false,
        message: 'No image file or base64 data provided',
      });
    }

    // Generate story using Gemini service
    console.log('🤖 Generating story...');
    const story = await generateMonumentStory(imageBase64);
    console.log('✅ Story generated successfully');
    
    // Try to generate audio (prefer ElevenLabs if configured, fallback to Google TTS, then gTTS)
    let audioBase64: string | null = null;
    let audioError: string | undefined = undefined;
    
    try {
      console.log('🎵 Converting story to audio...');
      
      // Try ElevenLabs first if API key is available
      if (process.env.ELEVENLABS_API_KEY && process.env.VOICE_ID) {
        try {
          audioBase64 = await generateAudioWithElevenLabs(story);
          console.log('✅ ElevenLabs audio generated successfully');
        } catch (elevenLabsError: any) {
          console.log('⚠️ ElevenLabs failed, falling back to Google TTS:', elevenLabsError.message);
          
          // Try Google TTS
          try {
            audioBase64 = await generateAudioFromText(story);
          } catch (googleError: any) {
            console.log('⚠️ Google TTS failed, trying gTTS library:', googleError.message);
            audioBase64 = await generateAudioWithGTTS(story);
          }
        }
      } else {
        // Use Google TTS as primary option with gTTS fallback
        try {
          audioBase64 = await generateAudioFromText(story);
        } catch (googleError: any) {
          console.log('⚠️ Google TTS failed, trying gTTS library:', googleError.message);
          audioBase64 = await generateAudioWithGTTS(story);
        }
      }
    } catch (err: any) {
      console.log('⚠️ All audio generation methods failed:', err.message);
      audioError = err.message;
    }
    
    // Return response
    const responseData: MonumentStory = {
      story,
      audio: audioBase64,
      audioAvailable: !!audioBase64,
      audioError: audioError,
      imageSize,
      imageType,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('❌ Monument analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze monument. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};