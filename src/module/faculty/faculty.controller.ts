import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from "@/errors/AppError.js";
import { Request, Response, NextFunction } from "express";
import { facultyServices } from "./faculty.service.js";
import { successResponse } from "@/utils/responses.js";

class FacultyController {
  // create faculty
  async createFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, levelId } = req.body;

      if (!name) throw new BadRequestError("Provide faculty name.");
      if (!levelId)
        throw new BadRequestError("Provide level ID for the faculty.");

      const faculty = await facultyServices.checkfacultyExist({
        name,
        levelId,
      });
      if (faculty)
        throw new ConflictError("faculty already exist in this level.");

      const newFaculty = await facultyServices.createFaculty({ name, levelId });
      if (!newFaculty)
        throw new InternalError("Failed to create faculty, please try again");

      return successResponse(
        res,
        201,
        newFaculty,
        "Faculty created successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  //   get all faculties
  async getAllFaculties(req: Request, res: Response, next: NextFunction) {
    try {
      const faculties = await facultyServices.getAllFaculties();
      return successResponse(
        res,
        200,
        faculties,
        "Faculties retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  //   get faculty by Id
  async getFacultyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { facultyId } = req.params;
      if (!facultyId)
        throw new BadRequestError("Provide faculty id to continue.");

      const faculty = await facultyServices.getFacultyById(facultyId as string);
      if (!faculty)
        throw new NotFoundError(`Faculty not found with id: ${facultyId}`);

      return successResponse(
        res,
        200,
        faculty,
        "Faculty retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  //   get faculty by level id
  async getFacultiesByLevelId(req: Request, res: Response, next: NextFunction) {
    try {
      const { levelId } = req.params;
      if (!levelId) throw new BadRequestError("Provide level id to continue.");

      const faculties = await facultyServices.getFacultiesByLevelId(
        levelId as string,
      );
      if (!faculties)
        throw new NotFoundError(`Faculty not found with level id: ${levelId}.`);

      return successResponse(
        res,
        200,
        faculties,
        "Faculties for level retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  //   update faculty
  async updateFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const { facultyId } = req.params;
      const { name, levelId } = req.body;

      if (!name && !levelId)
        throw new BadRequestError(
          "Provide either name or parent level id to update.",
        );

      const faculty = await facultyServices.getFacultyById(facultyId as string);
      if (!faculty) throw new BadRequestError("Provide faculty id to update.");

      const updatedFaculty = await facultyServices.updateFaculty(faculty.id, {
        name,
        levelId,
      });
      if (!updatedFaculty)
        throw new NotFoundError("Faculty not found or failed to update.");

      return successResponse(
        res,
        200,
        updatedFaculty,
        "Faculty updated successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  //   delete faculty
  async deleteFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const { facultyId } = req.params;

      if (!facultyId)
        throw new BadRequestError("Provide faculty id to continue..");
      const faculty = await facultyServices.getFacultyById(facultyId as string);
      if (!faculty) throw new NotFoundError("Faculty not found.");

      const deletedfaculty = await facultyServices.deleteFaculty(faculty.id);
      if (!deletedfaculty) throw new InternalError("Failed to delet faculty.");

      return successResponse(
        res,
        200,
        deletedfaculty,
        "Faculty deleted successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const facultyController = new FacultyController();
