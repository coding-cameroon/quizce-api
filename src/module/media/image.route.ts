import { Router } from "express";
import upload from "@/config/multer.js";
import { imageController } from "./image.controller.js";

const router = Router();

router.get("/", imageController.getAllImages);
router.get("/:imageId", imageController.getImageById);
router.delete("/:imageId", imageController.deleteImage);
router.get("/:questionId/question", imageController.getImagesByQuestionId);
router.delete(
  "/:questionId/question",
  imageController.deleteImagesByQuestionId,
);
router.get("/:yearId/year", imageController.getImagesByYearId);
router.post(
  "/:questionId/upload",
  upload.array("images"),
  imageController.createImage,
);

export { router as imageRouter };
