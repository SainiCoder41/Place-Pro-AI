import Groq from "groq-sdk";
import env from "../../config/env.js";
import logger from "../../utils/logger.js";

let groq = null;

if (env.groqApiKey) {
  try {
    groq = new Groq({
      apiKey: env.groqApiKey,
    });
    logger.info("Groq client initialized");
  } catch (error) {
    logger.error("Failed to initialize Groq client", error);
  }
} else {
  logger.warn("GROQ_API_KEY not set — AI endpoints use fallback simulation");
}

export const isGroqConfigured = () => {
  return !!groq;
};

export const analyzeResume = async ({ resumeText, jobDescription, candidateCoreInfo }) => {
  const jdText = jobDescription || "General software development internship roles";
  const systemInstruction = `You are a veteran Corporate Recruitment Specialist and ATS Automated Screener. Analyze resumes against job requirements and output valid JSON only.`;
  const prompt = `Analyze this resume against the job description:

--- RESUME ---
${resumeText}
${candidateCoreInfo ? `Candidate Info: ${JSON.stringify(candidateCoreInfo)}` : ""}

--- JOB DESCRIPTION ---
${jdText}

Return JSON with exactly this structure:
{
  "atsScore": number,
  "resumeScore": number,
  "readinessRating": "Excellent" | "Good" | "Average" | "Needs Improvement",
  "skillGapAnalysis": {
    "detectedSkills": [string],
    "missingCriticalSkills": [string],
    "goodToHaveMissing": [string]
  },
  "improvementSuggestions": {
    "formatting": [string],
    "keywords": [string],
    "experienceImpact": [string]
  },
  "industryReadinessSummary": string
}`;

  try {
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
      });
      const response = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(response.trim());
      if (parsed.atsScore !== undefined && parsed.atsScore <= 1) {
        parsed.atsScore = Math.round(parsed.atsScore * 100);
      }
      if (parsed.resumeScore !== undefined && parsed.resumeScore <= 1) {
        parsed.resumeScore = Math.round(parsed.resumeScore * 100);
      }
      return parsed;
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.error("Groq Resume Analysis Error, running fallback:", err);
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
};

export const chatbot = async ({ messages, userRole, currentTab }) => {
  const systemInstruction = `You are the AI Career Assistant for a campus placement platform named PlacePro AI. Role: ${userRole || "student"}. Tab: ${currentTab || "general"}. Keep your responses professional, encouraging, and formatted in clear Markdown.`;
  const formattedMessages = messages.map((m) => ({
    role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
    content: m.content,
  }));

  try {
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemInstruction },
          ...formattedMessages,
        ],
      });
      const response = completion.choices[0]?.message?.content || "";
      return { content: response };
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.error("Groq Chatbot Error, running fallback:", err);
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
};

export const generateInterviewQuestions = async ({ jobTitle, jobDescription, roundType }) => {
  const round = roundType || "Technical";
  const systemInstruction = "You are a professional corporate interviewer. Generate exactly 5 original, high-quality interview questions as JSON array only.";
  const prompt = `Generate exactly 5 ${round} interview questions for the role: ${jobTitle || "Software Engineer Intern"}.
Job Description: ${jobDescription || "General Software Engineering, programming fundamentals, DSA, and problem solving."}.
Return JSON format ONLY:
{
  "questions": [
    { "id": 1, "question": "Question text...", "conceptsTested": "Concept description..." },
    ...
  ]
}`;

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
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
      });
      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(responseText.trim());
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error("Could not extract questions array");
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.error("Groq Generate Questions Error, running fallback:", err);
    return fallbackMap[round] || fallbackMap.Technical;
  }
};

export const evaluateInterview = async ({ jobTitle, roundType, qnas }) => {
  const systemInstruction = "Evaluate mock interview answers. Output valid JSON only.";
  const prompt = `Role: ${jobTitle || "Software Developer Intern"}, Round: ${roundType || "Technical"}
Evaluate these questions and answers:
${qnas.map((item, idx) => `Q${idx + 1}: ${item.question}\nA: ${item.answer}`).join("\n\n")}

Return JSON in this format:
{
  "totalScore": number,
  "grade": string,
  "readinessVerdict": string,
  "strengths": [string],
  "weaknesses": [string],
  "detailedQnaFeedback": [
    {
      "questionId": number,
      "question": string,
      "candidateAnswer": string,
      "score": number,
      "pros": string,
      "cons": string,
      "suggestedExcellentModelAnswer": string
    }
  ],
  "actionableTips": [string]
}`;

  try {
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
      });
      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(responseText.trim());
      if (parsed.totalScore !== undefined && parsed.totalScore <= 1) {
        parsed.totalScore = Math.round(parsed.totalScore * 100);
      }
      if (Array.isArray(parsed.detailedQnaFeedback)) {
        parsed.detailedQnaFeedback.forEach(f => {
          if (f.score !== undefined && f.score <= 1) {
            f.score = Math.round(f.score * 100);
          }
        });
      }
      return parsed;
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.error("Groq Evaluate Interview Error, running fallback:", err);
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
};

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