import { Router } from "express";
import { subjectController } from "./subject.controller.js";

const router = Router();

router.get("/", subjectController.getSubjects);
router.post("/new", subjectController.createSubject);
router.get("/:subjectId", subjectController.getSubjectById);
router.patch("/:subjectId", subjectController.updateSubject);
router.delete("/:subjectId", subjectController.deleteSubject);
router.get("/:facultyId/faculty", subjectController.getSubjectByFacultyId);

export { router as subjectRouter };
