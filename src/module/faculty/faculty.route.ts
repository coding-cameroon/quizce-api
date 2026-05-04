import { Router } from "express";
import { facultyController } from "./faculty.controller.js";

const router = Router();

router.get("/", facultyController.getAllFaculties);
router.post("/new", facultyController.createFaculty);
router.get("/:facultyId", facultyController.getFacultyById);
router.patch("/:facultyId", facultyController.updateFaculty);
router.delete("/:facultyId", facultyController.deleteFaculty);
router.get("/:levelId/level", facultyController.getFacultiesByLevelId);

export { router as facultyRouter };
