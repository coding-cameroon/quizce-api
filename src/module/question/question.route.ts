import { Router } from "express";
import { questionController } from "./question.controller.js";

const router = Router();

router.get("/", questionController.getAllQuestions);
router.post("/new", questionController.createQuestion);
router.get("/:questionId", questionController.getQuestionById);
router.delete("/:questionId", questionController.deleteQuestion);
router.get("/:yearId/year", questionController.getQuestionsByYearId);
router.delete("/:yearId/year", questionController.deleteQuestionsByYearId);

export { router as questionRouter };
