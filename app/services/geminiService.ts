import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Session } from "../types/session";
import { Schedule, Speaker } from "../types/schedule";

// Helper function to find more info for a session
const getMoreInfoBySessionId = (sessionId: string, allMoreInfo: any[] | undefined): any | null => {
  if (!allMoreInfo) return null;
  return allMoreInfo.find(info => info['Session ID'] === sessionId) || null;
};

// Helper function to get speaker names from the main schedule data
const getSpeakerNamesFromSchedule = (speakerIds: string[], scheduleData: Schedule | undefined): string[] => {
  if (!scheduleData || !scheduleData.speakers) return [];
  return speakerIds.map(id => {
    const speaker = scheduleData.speakers.find(s => s.id === id);
    return speaker ? speaker.name : "Unknown Speaker";
  });
};

export async function generateSessionSummary(
  session: Session,
  scheduleData: Schedule | undefined, // Main schedule data containing speaker details
  allMoreInfo: any[] | undefined // The array from schedule-more-info.json
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API key not found. Make sure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env file.");
    return "Error: Gemini API key not configured.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generationConfig = {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 200,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  let promptContent = `Generate a concise 3-sentence summary for the following conference session. Highlight the key takeaways or main topics.
Session Title: ${session.title}`;

  if (session.description) {
    promptContent += `
Description: ${session.description}`;
  }

  // Ensure session.speakers is an array of strings
  const speakerIds = Array.isArray(session.speakers) ? session.speakers : [];
  const speakerNames = getSpeakerNamesFromSchedule(speakerIds, scheduleData);
  if (speakerNames.length > 0) {
    promptContent += `
Speakers: ${speakerNames.join(", ")}`;
  }

  const moreInfo = getMoreInfoBySessionId(String(session.id), allMoreInfo);
  if (moreInfo) {
    if (moreInfo["Session Format"]) {
      promptContent += `
Format: ${moreInfo["Session Format"]}`;
    }
    if (moreInfo["Level"]) {
      promptContent += `
Level: ${moreInfo["Level"]}`;
    }
  }

  promptContent += "

Summary (3 sentences):";

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptContent }] }],
      generationConfig,
      safetySettings,
    });

    if (result.response) {
      const summary = result.response.text();
      const sentences = summary.split(/[.!?]/).filter(s => s.trim().length > 0);
      return sentences.slice(0, 3).join(". ") + (sentences.length > 0 ? "." : "");
    } else {
      return "Error: Could not generate summary (empty response).";
    }
  } catch (error) {
    console.error("Error generating session summary with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("API key not valid")) {
        return "Error: Invalid Gemini API key.";
    }
    if (errorMessage.includes("quota")) {
        return "Error: API quota exceeded. Please check your Gemini plan.";
    }
    return `Error generating summary: ${errorMessage}`;
  }
}
