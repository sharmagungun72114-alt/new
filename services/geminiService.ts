
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

const SYSTEM_INSTRUCTION = `You are an AI-based voice analysis system designed to detect whether a given audio sample is AI-generated or Human-spoken.
Analyze the audio for characteristics such as:
- Natural prosody and intonation
- Speech artifacts or synthesis patterns
- Consistency in pitch, rhythm, and pauses
- Background noise and microphone imperfections

The audio may be in Tamil, English, Hindi, Malayalam, or Telugu.
You must return a JSON response with classification and confidence score.`;

export const analyzeVoice = async (base64Audio: string, mimeType: string): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Analyze this audio sample and determine if it is human or AI-generated. Provide the output in JSON format."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: {
              type: Type.STRING,
              description: "AI_GENERATED or HUMAN",
            },
            confidence_score: {
              type: Type.NUMBER,
              description: "Value between 0.0 and 1.0",
            },
            explanation: {
              type: Type.STRING,
              description: "A brief reason for the classification based on audio features observed.",
            }
          },
          required: ["classification", "confidence_score"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
