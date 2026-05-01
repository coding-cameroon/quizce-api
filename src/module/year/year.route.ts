import { Router } from "express";
import { yearController } from "./year.controller.js";

const router = Router();

router.get("/", yearController.getAllYears);
router.post("/new", yearController.createYear);
router.get("/:yearId", yearController.getYearById);
router.patch("/:yearId", yearController.updateYear);
router.delete("/:yearId", yearController.deleteYear);
router.get("/:subjectId/subject", yearController.getYearsBySubjectId);

export { router as yearRouter };
