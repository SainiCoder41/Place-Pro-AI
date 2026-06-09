import { GoogleGenAI } from "@google/genai";
import env from "../../config/env.js";
import logger from "../../utils/logger.js";

let ai = null;

if (env.geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: env.geminiApiKey,
      httpOptions: { headers: { "User-Agent": "placepro-api" } },
    });
    logger.info("Gemini client initialized");
  } catch (error) {
    logger.error("Failed to initialize Gemini client", error);
  }
} else {
  logger.warn("GEMINI_API_KEY not set — AI endpoints use fallback simulation");
}

async function getGeminiResponse(prompt, expectJson = false, systemInstruction = "") {
  if (!ai) throw new Error("Gemini AI client is not initialized.");
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || undefined,
      responseMimeType: expectJson ? "application/json" : "text/plain",
    },
  });
  return response.text;
}

export function isGeminiConfigured() {
  return !!ai;
}

export async function analyzeResume({ resumeText, jobDescription, candidateCoreInfo }) {
  const jdText = jobDescription || "General software development internship roles";
  const systemInstruction = `You are a veteran Corporate Recruitment Specialist and ATS Automated Screener. Analyze resumes and output valid JSON only.`;
  const prompt = `Analyze this resume against the job description:

--- RESUME ---
${resumeText}
${candidateCoreInfo ? `Candidate Info: ${JSON.stringify(candidateCoreInfo)}` : ""}

--- JOB DESCRIPTION ---
${jdText}

Return JSON: { "atsScore": number, "resumeScore": number, "readinessRating": string, "skillGapAnalysis": { "detectedSkills": [], "missingCriticalSkills": [], "goodToHaveMissing": [] }, "improvementSuggestions": { "formatting": [], "keywords": [], "experienceImpact": [] }, "industryReadinessSummary": string }`;

  try {
    if (ai) {
      const text = await getGeminiResponse(prompt, true, systemInstruction);
      return JSON.parse(text.trim());
    }
    throw new Error("Gemini not configured");
  } catch {
    const mockScore = Math.floor(Math.random() * 20) + 65;
    return {
      atsScore: mockScore,
      resumeScore: mockScore + 3,
      readinessRating: mockScore > 80 ? "Excellent" : "Good",
      skillGapAnalysis: {
        detectedSkills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Git"],
        missingCriticalSkills: ["Database Design", "System Architecture", "Unit Testing"],
        goodToHaveMissing: ["Express.js", "Docker", "REST API Development"],
      },
      improvementSuggestions: {
        formatting: ["Use stronger action verbs.", "Add Certifications and Links sections."],
        keywords: ["Include 'API Integration', 'Full-Stack Development'."],
        experienceImpact: ["Quantify achievements with metrics."],
      },
      industryReadinessSummary: "Solid front-end fundamentals. Strengthen backend and database skills for full readiness.",
    };
  }
}

export async function chatbot({ messages, userRole, currentTab }) {
  const systemInstruction = `You are the AI Career Assistant for a campus placement platform. Role: ${userRole || "student"}. Tab: ${currentTab || "general"}. Use clear Markdown.`;
  const history = messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
  const prompt = `Conversation:\n${history}\n\nRespond to the latest query:`;

  try {
    if (ai) {
      const text = await getGeminiResponse(prompt, false, systemInstruction);
      return { content: text };
    }
    throw new Error("Gemini not configured");
  } catch {
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = "I can help with placement tips, mock interviews, and resume feedback. What would you like to focus on?";
    if (lastMsg.includes("resume")) {
      reply = "For a strong resume:\n1. **Single page**\n2. **Skills & Projects** near top\n3. Use **STAR format**\n4. Brief professional summary instead of objective";
    } else if (lastMsg.includes("interview")) {
      reply = "Interview prep: **Technical** (DSA, OOP), **Behavioral** (STAR), **HR** (motivation). Try the AI Mock Interview screen!";
    } else if (lastMsg.includes("job") || lastMsg.includes("internship")) {
      reply = "Land internships with **2-3 real projects**, master your stack, and get your profile **Verified** by placement office.";
    }
    return { content: reply };
  }
}

export async function generateInterviewQuestions({ jobTitle, jobDescription, roundType }) {
  const round = roundType || "Technical";
  const systemInstruction = "Generate 5 original interview questions as JSON array only.";
  const prompt = `Generate 5 ${round} interview questions for: ${jobTitle || "Software Engineer Intern"}. Description: ${jobDescription || "JS/TS, SPA, teamwork"}. Format: [{ "id": number, "question": string, "conceptsTested": string }]`;

  const fallbackMap = {
    Technical: [
      { id: 1, question: "Explain the difference between state and props in React.", conceptsTested: "React fundamentals" },
      { id: 2, question: "What is the Event Loop in JavaScript?", conceptsTested: "Async execution" },
      { id: 3, question: "How do you prevent SQL injection in APIs?", conceptsTested: "Security" },
      { id: 4, question: "How would you optimize a slow React SPA?", conceptsTested: "Performance" },
      { id: 5, question: "When would you use a Map vs Object?", conceptsTested: "DSA usage" },
    ],
    HR: [
      { id: 1, question: "Tell me about yourself and why you applied.", conceptsTested: "Motivation" },
      { id: 2, question: "Where do you see yourself in 3-5 years?", conceptsTested: "Career planning" },
      { id: 3, question: "Your biggest strength and area to improve?", conceptsTested: "Self-awareness" },
      { id: 4, question: "Why should we hire you?", conceptsTested: "Value proposition" },
      { id: 5, question: "Questions for us about culture?", conceptsTested: "Engagement" },
    ],
    Behavioral: [
      { id: 1, question: "Describe a team conflict and how you handled it.", conceptsTested: "Collaboration" },
      { id: 2, question: "A critical bug near a deadline — what did you do?", conceptsTested: "Pressure handling" },
      { id: 3, question: "Learning a new technology quickly?", conceptsTested: "Adaptability" },
      { id: 4, question: "A mistake on a project — how did you fix it?", conceptsTested: "Accountability" },
      { id: 5, question: "Leading a group project?", conceptsTested: "Leadership" },
    ],
  };

  try {
    if (ai) {
      const text = await getGeminiResponse(prompt, true, systemInstruction);
      return JSON.parse(text.trim());
    }
    throw new Error("Gemini not configured");
  } catch {
    return fallbackMap[round] || fallbackMap.Technical;
  }
}

export async function evaluateInterview({ jobTitle, roundType, qnas }) {
  const systemInstruction = "Evaluate mock interview answers. Output valid JSON only.";
  const prompt = `Role: ${jobTitle || "Software Developer Intern"}, Round: ${roundType || "Technical"}
${qnas.map((item, idx) => `Q${idx + 1}: ${item.question}\nA: ${item.answer}`).join("\n\n")}
Return JSON: { "totalScore", "grade", "readinessVerdict", "strengths", "weaknesses", "detailedQnaFeedback": [{ "questionId", "question", "candidateAnswer", "score", "pros", "cons", "suggestedExcellentModelAnswer" }], "actionableTips" }`;

  try {
    if (ai) {
      const text = await getGeminiResponse(prompt, true, systemInstruction);
      return JSON.parse(text.trim());
    }
    throw new Error("Gemini not configured");
  } catch {
    const feedbacks = qnas.map((q, idx) => {
      const len = q.answer?.trim().length || 0;
      const score = Math.min(Math.max(Math.floor(len * 0.4) + 40, 50), 95);
      return {
        questionId: idx + 1,
        question: q.question,
        candidateAnswer: q.answer || "(No Answer)",
        score,
        pros: len > 30 ? "Good conceptual approach." : "Baseline understanding shown.",
        cons: len < 50 ? "Too short — add examples." : "Could use STAR structure.",
        suggestedExcellentModelAnswer: "Define the term, give a real example, discuss edge cases and benefits.",
      };
    });
    const avg = Math.floor(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length) || 72;
    return {
      totalScore: avg,
      grade: avg > 85 ? "A" : avg > 70 ? "B" : avg > 55 ? "C" : "D",
      readinessVerdict: avg > 80 ? "Well prepared for corporate interviews." : "Solid foundations — improve technical depth.",
      strengths: ["Covers basic terminology", "Shows practical awareness"],
      weaknesses: ["Needs more elaboration", "Missing project references"],
      detailedQnaFeedback: feedbacks,
      actionableTips: ["Practice out loud", "Use STAR format", "Review OOP and DSA fundamentals"],
    };
  }
}

/** Manual applicant sorting — no AI ranking */
export function sortApplicantsManually(candidates) {
  return [...candidates]
    .map((c) => {
      const resumeMetric = c.resumeScore || 70;
      const interviewMetric = c.interviewScore || 0;
      const gpaMetric = parseFloat(c.gpa) ? parseFloat(c.gpa) * 10 : 75;
      const bonus = c.verified ? 5 : 0;
      const matchScore = Math.min(Math.floor((resumeMetric + (interviewMetric || resumeMetric) + gpaMetric) / 3) + bonus, 100);
      return { ...c, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((item, idx) => ({
      rank: idx + 1,
      name: item.name,
      matchScore: item.matchScore,
      keyReason: `Resume score ${item.resumeScore || "N/A"}, interview ${item.interviewScore || "pending"}, verification ${item.verified ? "approved" : "pending"}.`,
      recommendedRoles: idx === 0 ? ["Primary shortlist"] : ["Review manually"],
    }));
}
