import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from "@/errors/AppError.js";
import { Request, Response, NextFunction } from "express";
import { levelServices } from "./level.service.js";
import { successResponse } from "@/utils/responses.js";

class LevelController {
  async createlevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug } = req.body;

      if (!name) throw new BadRequestError("Provide level name to continue.");
      if (!slug) throw new BadRequestError("Provide level slug to continue.");

      const level = await levelServices.getLevelBySlug(slug);
      if (level)
        throw new ConflictError(`Level already exist with name: ${name}`);

      const newLevel = await levelServices.createLevel({ name, slug });
      if (!newLevel)
        throw new InternalError("Failed to create level, please try again");

      return successResponse(res, 201, newLevel, "Level created succesfully");
    } catch (error) {
      next(error);
    }
  }

  async getAllLevels(req: Request, res: Response, next: NextFunction) {
    try {
      const levels = await levelServices.getAllLevels();
      if (!levels)
        throw new InternalError("Failed to find levels, please try again");

      return successResponse(res, 200, levels, "Levels retrieved succesfully");
    } catch (error) {
      next(error);
    }
  }

  async getLevelById(req: Request, res: Response, next: NextFunction) {
    try {
      const { levelId } = req.params;

      if (!levelId) throw new BadRequestError("Provide level id to continue");

      const level = await levelServices.getLevel(levelId as string);
      if (!level)
        throw new NotFoundError(`Level not found with id: ${levelId}`);

      return successResponse(res, 200, level, "Level retrieved succesfully");
    } catch (error) {
      next(error);
    }
  }

  async getLevelBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      if (!slug) throw new BadRequestError("Provide level slug to continue");

      const level = await levelServices.getLevelBySlug(
        slug as "o_level" | "a_level",
      );
      if (!level) throw new NotFoundError(`Level not found with slug: ${slug}`);

      return successResponse(res, 200, level, "Level retrieved succesfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteLevelById(req: Request, res: Response, next: NextFunction) {
    try {
      const { levelId } = req.params;

      if (!levelId) throw new BadRequestError("Provide level id to continue");

      const level = await levelServices.getLevel(levelId as string);
      if (!level)
        throw new NotFoundError(`Level not found with id: ${levelId}`);

      const deletedLevel = await levelServices.deleteLevel(levelId as string);
      if (!deletedLevel) throw new InternalError("Failed to delete level.");

      return successResponse(
        res,
        200,
        deletedLevel,
        "Level deleted succesfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async updateLevelById(req: Request, res: Response, next: NextFunction) {
    try {
      const { levelId } = req.params;
      const { name, slug } = req.body;

      if (!levelId) throw new BadRequestError("Provide level id to continue.");
      if (!name && !slug)
        throw new BadRequestError(
          "Provide either level name por slug to continue.",
        );

      const level = await levelServices.getLevel(levelId as string);
      if (!level)
        throw new NotFoundError(`Level not found with id: ${levelId}`);

      const updatedLevel = await levelServices.updateLevel(levelId as string, {
        name,
        slug,
      });
      if (!updatedLevel) throw new InternalError("Failed to update level.");

      return successResponse(
        res,
        200,
        updatedLevel,
        "Level updated succesfully",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const levelController = new LevelController();
