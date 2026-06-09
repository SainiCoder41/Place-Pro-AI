import { Router } from "express";
import * as aiController from "./ai.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.get("/health", aiController.health);

// Gemini AI endpoints (legacy paths preserved for frontend compatibility)
router.post("/gemini/analyze-resume", authenticate, aiController.analyzeResume);
router.post("/gemini/chatbot", authenticate, aiController.chatbot);
router.post("/gemini/mock-interview/generate-questions", authenticate, aiController.generateQuestions);
router.post("/gemini/mock-interview/evaluate", authenticate, aiController.evaluateInterview);
router.post("/gemini/rank-candidates", authenticate, aiController.sortApplicants);

// Module-style aliases
router.post("/resume/analyze", authenticate, aiController.analyzeResume);
router.post("/chatbot", authenticate, aiController.chatbot);
router.post("/mock-interview/start", authenticate, aiController.generateQuestions);
router.post("/mock-interview/submit-answer", authenticate, aiController.evaluateInterview);
router.post("/mock-interview/result/:id", authenticate, aiController.evaluateInterview);

export default router;
