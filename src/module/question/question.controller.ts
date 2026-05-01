import { Request, Response, NextFunction } from "express";
import { questionServices } from "./question.service.js";
import { yearServices } from "../year/year.service.js";
import { imageServices } from "../media/media.service.js";
import {
  BadRequestError,
  NotFoundError,
  InternalError,
} from "@/errors/AppError.js";
import { successResponse } from "@/utils/responses.js";
import type { NewQuestion, Question } from "@/db/schema/question.schema.js";

interface QuestionInput {
  yearId: string;
  number: number;
  question: string;
  imageType?: "none" | "question_image" | "option_images";
  explanation: string;
  correctOption: string;
  options: string[];
}

class QuestionController {
  async createQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { questions }: { questions: QuestionInput[] } = req.body;

      if (!questions || questions.length === 0)
        throw new BadRequestError(
          "Provide a questions array with all required fields.",
        );

      // Validate each question has required fields
      for (const q of questions) {
        if (
          !q.yearId ||
          !q.number ||
          !q.question ||
          !q.explanation ||
          !q.correctOption ||
          !q.options ||
          q.options.length === 0
        )
          throw new BadRequestError(
            `Question #${q.number ?? "unknown"} is missing required fields.`,
          );
      }

      const firstYearId = questions[0].yearId;

      const year = await yearServices.getYearById(firstYearId as string);
      if (!year)
        throw new NotFoundError(
          `Year not found with ID: ${firstYearId}. Can't create questions for a non-existing year.`,
        );

      const allSameYear = questions.every((q) => q.yearId === firstYearId);
      if (!allSameYear)
        throw new BadRequestError(
          "All questions in one request must belong to the same year.",
        );

      const formattedQuestions: NewQuestion[] = questions.map((q) => ({
        question: q.question,
        options: q.options,
        imageType: q.imageType ?? "none",
        number: q.number,
        correctOption: q.correctOption,
        explanation: q.explanation,
        yearId: q.yearId,
      }));

      const created =
        await questionServices.createQuestions(formattedQuestions);
      if (!created || created.length === 0)
        throw new InternalError("Failed to create questions.");

      return successResponse(
        res,
        201,
        created,
        "Questions created successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { yearId } = req.query;

      const data = await questionServices.getAllQuestions(
        yearId ? (yearId as string) : undefined,
      );

      return successResponse(
        res,
        200,
        data,
        "Questions retrieved successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async getQuestionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      if (!questionId) throw new BadRequestError("Provide a question ID.");

      const question = await questionServices.getQuestionById(
        questionId as string,
      );
      if (!question)
        throw new NotFoundError(`Question not found with ID: ${questionId}.`);

      return successResponse(
        res,
        200,
        question,
        "Question retrieved successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async getQuestionsByYearId(req: Request, res: Response, next: NextFunction) {
    try {
      const { yearId } = req.params;
      if (!yearId) throw new BadRequestError("Provide a year ID.");

      const year = await yearServices.getYearById(yearId as string);
      if (!year) throw new NotFoundError(`Year not found with ID: ${yearId}.`);

      const questions = await questionServices.getQuestionsByYearId(
        yearId as string,
      );

      return successResponse(
        res,
        200,
        questions,
        "Questions retrieved successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      if (!questionId) throw new BadRequestError("Provide a question ID.");

      const question = await questionServices.getQuestionById(
        questionId as string,
      );
      if (!question)
        throw new NotFoundError(`Question not found with ID: ${questionId}.`);

      if (question.images && question.images.length > 0) {
        const fileIds = question.images
          .map((img: any) => img.fileId)
          .filter(Boolean) as string[];

        if (fileIds.length > 0) {
          await imageServices.deleteMultipleImagesFromCloud(fileIds);
        }
      }

      const deleted = await questionServices.deleteQuestion(
        questionId as string,
      );
      if (!deleted) throw new InternalError("Failed to delete question.");

      return successResponse(
        res,
        200,
        deleted,
        "Question deleted successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestionsByYearId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { yearId } = req.params;
      if (!yearId) throw new BadRequestError("Provide a year ID.");

      const year = await yearServices.getYearById(yearId as string);
      if (!year) throw new NotFoundError(`Year not found with ID: ${yearId}.`);

      const questions = await questionServices.getQuestionsByYearId(
        yearId as string,
      );

      // Clean up ImageKit images before deleting
      if (questions.length > 0) {
        const fileIds = questions
          .flatMap((q: any) => q.images ?? [])
          .map((img: any) => img.fileId)
          .filter(Boolean) as string[];

        if (fileIds.length > 0) {
          await imageServices.deleteMultipleImagesFromCloud(fileIds);
        }
      }

      const deleted = await questionServices.deleteQuestionsByYearId(
        yearId as string,
      );
      if (!deleted) throw new InternalError("Failed to delete questions.");

      return successResponse(
        res,
        200,
        deleted,
        `${deleted.length} questions deleted successfully.`,
      );
    } catch (error) {
      next(error);
    }
  }
}

export const questionController = new QuestionController();
