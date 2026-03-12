import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const SYSTEM_PROMPT = `You are Zenith, an AI placement assistant for a college campus placement portal.
Your role is strictly limited to helping students with placement-related topics:
- Upcoming company drives and schedules
- Resume and CV tips
- Interview preparation (technical, HR, aptitude)
- Eligibility criteria (GPA, backlogs, branch requirements)
- Application status and deadlines
- Selection rounds and processes
- Portal usage guidance
- Internship opportunities
- Placement announcements and notifications
- General placement FAQs

Rules:
1. ONLY answer placement-related questions. If asked about anything else (academics, fees, hostel, personal topics, general knowledge, coding help unrelated to placements, etc.), politely decline and redirect to placement topics.
2. Keep answers concise, practical, and student-friendly.
3. If you don't have specific real-time data (e.g., exact company schedules), advise the student to check the portal's Companies or Notifications section.
4. Never make up company names, packages, or dates.
5. Always maintain an encouraging, professional tone.
6. Format responses clearly — use short paragraphs or bullet points when listing multiple items.
7. Do not answer questions about other AI models, politics, entertainment, or anything outside placement context.`;

export interface ChatHistoryEntry {
  role: "user" | "model";
  parts: { text: string }[];
}

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI;
};

export const getZenithResponse = async (
  query: string,
  history: ChatHistoryEntry[],
  portalContext?: string
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return "Zenith is not configured. Please contact the administrator.";
  }

  try {
    const systemInstruction = portalContext
      ? `${SYSTEM_PROMPT}\n\nCURRENT STUDENT PORTAL DATA (use this to give personalised answers):\n${portalContext}`
      : SYSTEM_PROMPT;

    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(query);
    return result.response.text();
  } catch (err: any) {
    console.error("Zenith Gemini error:", err);
    return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
};
