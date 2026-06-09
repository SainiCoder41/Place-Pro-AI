import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const analyzeResume = async (resumeText) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You are an ATS resume analyzer. Return only valid JSON.",
      },
      {
        role: "user",
        content: `
Analyze this resume and return JSON in the format:

{
  "overallScore": 0,
  "skills": [],
  "strengths": [],
  "weaknesses": [],
  "missingKeywords": [],
  "recommendedRoles": [],
  "improvements": []
}

Resume:
${resumeText}
`,
      },
    ],
  });

  const response = completion.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(response);
  } catch {
    return {
      rawAnalysis: response,
    };
  }
};