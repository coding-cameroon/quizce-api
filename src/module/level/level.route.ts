import { Router } from "express";
import { levelController } from "./level.controller.js";
const router = Router();

router.get("/", levelController.getAllLevels);
router.post("/new", levelController.createlevel);
router.get("/:levelId", levelController.getLevelById);
router.get("/:slug/slug", levelController.getLevelBySlug);
router.patch("/:levelId", levelController.updateLevelById);
router.delete("/:levelId", levelController.deleteLevelById);

export { router as levelRouter };
