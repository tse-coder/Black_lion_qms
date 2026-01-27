import Audixa from "audixa";

const API_KEY = import.meta.env.VITE_AUDIXA_API_KEY || "YOUR_AUDIXA_API_KEY";

export interface AudixaConfig {
  voice?: string;
  model?: "base" | "advance";
  speed?: number;
}

/**
 * Generates speech using Audixa SDK
 */
export async function generateSpeech(
  text: string,
  config: AudixaConfig = {},
): Promise<string> {
  const { voice = "af_zoey", model = "base", speed = 1.0 } = config;

  if (!API_KEY || API_KEY === "YOUR_AUDIXA_API_KEY") {
    console.warn(
      "[AUDIXA] API Key missing. Please set VITE_AUDIXA_API_KEY in .env",
    );
    throw new Error("Audixa API Key missing");
  }

  try {
    // Create Audixa client
    const audixa = new Audixa(API_KEY);

    // Generate TTS and wait for completion
    const audioUrl = await audixa.generateTTS({
      text,
      voice,
      model,
      speed,
    });

    return audioUrl;
  } catch (error) {
    console.error("[AUDIXA] Full error object:", error);
    throw error;
  }
}

/**
 * Convenience function to announce a patient
 */
export async function announcePatient(queueNumber: string, department: string) {
  const text = `Attention please. Queue number ${queueNumber
    .split("")
    .join(" ")}, please proceed to the ${department} department.`;

  try {
    const url = await generateSpeech(text);
    const audio = new Audio(url);
    await audio.play();
  } catch (error) {
    console.error("[AUDIXA] Announcement failed:", error);
  }
}
