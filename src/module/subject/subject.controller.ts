import { Request, Response, NextFunction } from "express";
import { subjectServices } from "./subject.service.js";
import {
  BadRequestError,
  NotFoundError,
  InternalError,
  ConflictError,
} from "@/errors/AppError.js";
import { successResponse } from "@/utils/responses.js";
import { facultyServices } from "../faculty/faculty.service.js";

class SubjectController {
  async createSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, facultyId, slug } = req.body;
      if (!name || !facultyId || !slug)
        throw new BadRequestError("Missing required fields.");

      const faculty = await facultyServices.getFacultyById(facultyId);
      if (!faculty)
        throw new BadRequestError("Can't create subject of a ghost faculty.");

      const subject = await subjectServices.checkSubjectExists(
        name,
        faculty.id,
      );
      if (subject)
        throw new ConflictError("Subject already exist in this faculty.");

      const newSubject = await subjectServices.createSubject({
        name,
        slug,
        facultyId: faculty.id,
      });
      return successResponse(
        res,
        201,
        newSubject,
        "Subject created successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await subjectServices.getAllSubjects();
      return successResponse(
        res,
        200,
        data,
        "Subjects retrieved successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async getSubjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;
      if (!subjectId)
        throw new BadRequestError("Provide subject id to continue.");

      const subject = await subjectServices.getSubjectById(subjectId as string);

      if (!subject) throw new InternalError("Failed to get subject.");
      return successResponse(res, 200, subject, "Subject retrieved");
    } catch (error) {
      next(error);
    }
  }

  async getSubjectByFacultyId(req: Request, res: Response, next: NextFunction) {
    try {
      const { facultyId } = req.params;
      if (!facultyId)
        throw new BadRequestError("Provide subject id to continue.");

      const subject = await subjectServices.getSubjectByFacultyId(
        facultyId as string,
      );
      if (!subject)
        throw new InternalError("Failed to get subject by faculty.");

      return successResponse(res, 200, subject, "Subject retrieved");
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;
      const { name, slug, facultyId } = req.body;

      if (!subjectId)
        throw new BadRequestError("Provide subject id to continue.");

      if (!name && !slug && !facultyId)
        throw new BadRequestError(
          "Provide either name,slug or faculty id to update.",
        );

      const updated = await subjectServices.updateSubject(subjectId as string, {
        name,
        slug,
        facultyId,
      });
      if (!updated) throw new InternalError("Failed to update subject.");

      return successResponse(res, 200, updated, "Subject updated");
    } catch (error) {
      next(error);
    }
  }

  async deleteSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;

      if (!subjectId)
        throw new BadRequestError("Provide subject id to continue.");

      const deleted = await subjectServices.deleteSubject(subjectId as string);
      if (!deleted) throw new InternalError("Failed to delete subject.");

      return successResponse(res, 200, deleted, "Subject deleted");
    } catch (error) {
      next(error);
    }
  }
}

export const subjectController = new SubjectController();
