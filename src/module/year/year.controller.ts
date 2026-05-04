import { Request, Response, NextFunction } from "express";
import { yearServices } from "./year.service.js";
import { subjectServices } from "../subject/subject.service.js";
import {
  BadRequestError,
  NotFoundError,
  InternalError,
  ConflictError,
} from "@/errors/AppError.js";
import { successResponse } from "@/utils/responses.js";

class YearController {
  async createYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { names, subjectId } = req.body;
      if (!names || !subjectId)
        throw new BadRequestError("Provide year names and subject ID.");

      const subject = await subjectServices.getSubjectById(subjectId as string);
      if (!subject)
        throw new NotFoundError(
          "Subject not found. Can't create year for a ghost subject.",
        );

      const yearNames: string[] = (names as string)
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);

      if (yearNames.length === 0)
        throw new BadRequestError("Provide at least one valid year name.");

      const levelName = subject.faculty?.level?.name;
      const yearLevel = levelName === "Advanced Level" ? "A Level" : "O Level";

      const year = await yearServices.findExistingYears(yearNames, subject.id);
      if (year)
        throw new ConflictError("Year(s) already exist. Verify and retry.");

      const newYears = await yearServices.createYears(
        yearNames,
        subject.id,
        yearLevel,
      );
      if (!newYears || newYears.length === 0)
        throw new InternalError("Failed to create years.");

      return successResponse(res, 201, newYears, "Years created successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getAllYears(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await yearServices.getAllYears();
      return successResponse(res, 200, data, "Years retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getYearById(req: Request, res: Response, next: NextFunction) {
    try {
      const { yearId } = req.params;
      if (!yearId) throw new BadRequestError("Provide a year ID.");

      const year = await yearServices.getYearById(yearId as string);
      if (!year) throw new NotFoundError(`Year not found with ID: ${yearId}.`);

      return successResponse(res, 200, year, "Year retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getYearsBySubjectId(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;
      if (!subjectId) throw new BadRequestError("Provide a subject ID.");

      const subject = await subjectServices.getSubjectById(subjectId as string);
      if (!subject)
        throw new NotFoundError(`Subject not found with ID: ${subjectId}.`);

      const years = await yearServices.getYearsBySubjectId(subjectId as string);
      if (!years) throw new InternalError("Failed to retrieve years.");

      return successResponse(res, 200, years, "Years retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async updateYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { yearId } = req.params;
      const { name, subjectId } = req.body;

      if (!yearId) throw new BadRequestError("Provide a year ID.");
      if (!name && !subjectId)
        throw new BadRequestError("Provide at least one field to update.");

      const year = await yearServices.getYearById(yearId as string);
      if (!year) throw new NotFoundError(`Year not found with ID: ${yearId}.`);

      let updatedName = year.name;

      if (name) {
        // Preserve existing level prefix and replace only the year part
        const levelPrefix = year.name.includes("A Level")
          ? "A Level"
          : "O Level";
        updatedName = `GCE June ${levelPrefix} - ${name}`;
      }

      if (subjectId) {
        const subject = await subjectServices.getSubjectById(
          subjectId as string,
        );
        if (!subject)
          throw new NotFoundError(`Subject not found with ID: ${subjectId}.`);

        const levelName = subject.faculty?.level?.name;
        const yearLevel =
          levelName === "Advanced Level" ? "A Level" : "O Level";

        // Rebuild name with new level if subjectId changed
        const rawYearName = year.name.split(" - ")[1] ?? name;
        updatedName = `GCE June ${yearLevel} - ${rawYearName}`;
      }

      const updated = await yearServices.updateYear(yearId as string, {
        name: updatedName,
        ...(subjectId && { subjectId: subjectId as string }),
      });
      if (!updated) throw new InternalError("Failed to update year.");

      return successResponse(res, 200, updated, "Year updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async deleteYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { yearId } = req.params;
      if (!yearId) throw new BadRequestError("Provide a year ID.");

      const year = await yearServices.getYearById(yearId as string);
      if (!year) throw new NotFoundError(`Year not found with ID: ${yearId}.`);

      const deleted = await yearServices.deleteYear(yearId as string);
      if (!deleted) throw new InternalError("Failed to delete year.");

      return successResponse(res, 200, deleted, "Year deleted successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const yearController = new YearController();
