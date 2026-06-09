import * as geminiService from "./gemini.service.js";
import { success } from "../../utils/apiResponse.js";
import * as groqService from "./groqService.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

export const health = asyncHandler(async (_req, res) => {
  return success(res, { status: "ok", geminiConfigured: geminiService.isGeminiConfigured() });
});

export const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({
      success: false,
      message: "resumeText is required",
    });
  }

  try {
    const result = await groqService.analyzeResume(resumeText);

    return res.status(200).json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
});

export const chatbot = asyncHandler(async (req, res) => {
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    return res.status(400).json({ success: false, message: "messages array is required" });
  }
  const result = await geminiService.chatbot(req.body);
  return res.json(result);
});

export const generateQuestions = asyncHandler(async (req, res) => {
  const result = await geminiService.generateInterviewQuestions(req.body);
  return res.json(result);
});

export const evaluateInterview = asyncHandler(async (req, res) => {
  if (!req.body.qnas || !Array.isArray(req.body.qnas)) {
    return res.status(400).json({ success: false, message: "qnas array is required" });
  }
  const result = await geminiService.evaluateInterview(req.body);
  return res.json(result);
});

/** Manual sort for recruiter applicant review — replaces AI ranking */
export const sortApplicants = asyncHandler(async (req, res) => {
  if (!req.body.candidates || !Array.isArray(req.body.candidates)) {
    return res.status(400).json({ success: false, message: "candidates array is required" });
  }
  const result = geminiService.sortApplicantsManually(req.body.candidates);
  return res.json(result);
});
