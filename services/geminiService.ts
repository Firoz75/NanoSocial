import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContentResponse, Platform } from "../types";

// Constants for Model Names
const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-2.5-flash-image";

/**
 * Generates social media posts based on a topic using Gemini 2.5 Flash.
 */
export const generateSocialContent = async (topic: string, language: string = 'English'): Promise<GeneratedContentResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a world-class social media marketing expert. 
    Topic: "${topic}".
    Target Language: "${language}".
    
    Generate 6 platform-specific posts in ${language}:
    1. Facebook: friendly, slightly longer, storytelling or informative.
    2. Instagram: caption with hooks, hashtags, emoji, visual-first.
    3. LinkedIn: professional tone, value-driven, leadership voice.
    4. Twitter/X: concise, bold, trending, optionally with hashtags or emoji.
    5. WhatsApp: professional tone, emoji, value-driven, concise.
    6. Google Business Profile: professional, informative, update or event focus, clear Call to Action (CTA).

    Also provide a specific visual art prompt suggestion for each that matches the post's specific tone, 
    and one overarching creative brief for the campaign visuals.

    Important: 
    - The "content" of the posts MUST be in ${language}.
    - The "rationale" can be in English or ${language} (whichever is more professional).
    - The "imagePromptSuggestion" should remain in English for better image generation compatibility.
  `;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          baseCreativeBrief: { type: Type.STRING, description: "A general creative brief for the campaign visuals." },
          posts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING, enum: Object.values(Platform) },
                content: { type: Type.STRING, description: "The actual post text." },
                rationale: { type: Type.STRING, description: "Why this tone/format fits the platform." },
                imagePromptSuggestion: { type: Type.STRING, description: "A specific prompt to generate an image for this post." }
              },
              required: ["platform", "content", "rationale", "imagePromptSuggestion"]
            }
          }
        },
        required: ["posts", "baseCreativeBrief"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini.");
  
  return JSON.parse(text) as GeneratedContentResponse;
};

/**
 * Generates an image from a text prompt using Gemini 2.5 Flash Image.
 */
export const generateImage = async (prompt: string, referenceImage?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];
  
  // If reference image provided, add it first (as prompt input)
  if (referenceImage) {
    const matches = referenceImage.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
        parts.push({
            inlineData: {
                mimeType: matches[1],
                data: matches[2]
            }
        });
    }
  }

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: parts
    },
    // No responseMimeType for image generation on this model
  });

  // Iterate to find the image part
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
};

/**
 * Edits an existing image based on a text prompt using Gemini 2.5 Flash Image.
 */
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Extract pure base64 data and mime type
  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image format.");
  }
  const mimeType = matches[1];
  const data = matches[2];

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: data
          }
        },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No edited image generated.");
};