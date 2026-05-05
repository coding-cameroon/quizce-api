import { Request, Response, NextFunction } from "express";
import { imageServices } from "./media.service.js";
import { questionServices } from "../question/question.service.js";
import { yearServices } from "../year/year.service.js";
// import { mediaService } from "../media/media.service.js";
import {
  BadRequestError,
  NotFoundError,
  InternalError,
} from "@/errors/AppError.js";
import { successResponse } from "@/utils/responses.js";
import type { Image, NewImage } from "@/db/schema/image.schema.js";

class ImageController {
  async createImage(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const { questionId } = req.params;

      if (!files || files.length === 0)
        throw new BadRequestError("Provide at least one image file.");
      if (!questionId) throw new BadRequestError("Provide a question ID.");

      const question = await questionServices.getQuestionById(
        questionId as string,
      );
      if (!question)
        throw new NotFoundError(`Question not found with ID: ${questionId}.`);

      if (question.imageType === "none")
        throw new BadRequestError(
          `Question #${question.number} does not accept images.`,
        );

      // Validate option_images constraints
      if (question.imageType === "option_images") {
        for (const file of files) {
          const optionIndex = (file as any).optionIndex;
          if (optionIndex === undefined || optionIndex === null)
            throw new BadRequestError(
              "Each image must include an optionIndex when imageType is option_images.",
            );
        }
      }

      // Upload all files to ImageKit
      const uploadResults = await imageServices.uploadMultipleImages(
        files,
        "questions",
      );

      const formattedImages: NewImage[] = uploadResults.map((result, i) => ({
        questionId: questionId as string,
        imageUrl: result.url,
        publicId: result.fileId,
        optionIndex: (files[i] as any).optionIndex ?? null,
      }));

      const created = await imageServices.createImages(formattedImages);
      if (!created || created.length === 0)
        throw new InternalError("Failed to save images.");

      return successResponse(
        res,
        201,
        created,
        `${created.length} image(s) uploaded successfully.`,
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllImages(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await imageServices.getAllImages();
      return successResponse(res, 200, data, "Images retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getImageById(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageId } = req.params;
      if (!imageId) throw new BadRequestError("Provide an image ID.");

      const image = await imageServices.getImageById(imageId as string);
      if (!image)
        throw new NotFoundError(`Image not found with ID: ${imageId}.`);

      return successResponse(res, 200, image, "Image retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getImagesByQuestionId(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      if (!questionId) throw new BadRequestError("Provide a question ID.");

      const question = await questionServices.getQuestionById(
        questionId as string,
      );
      if (!question)
        throw new NotFoundError(`Question not found with ID: ${questionId}.`);

      const data = await imageServices.getImagesByQuestionId(
        questionId as string,
      );
      return successResponse(res, 200, data, "Images retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getImagesByYearId(req: Request, res: Response, next: NextFunction) {
    try {
      const { yearId } = req.params;
      if (!yearId) throw new BadRequestError("Provide a year ID.");

      const year = await yearServices.getYearById(yearId as string);
      if (!year) throw new NotFoundError(`Year not found with ID: ${yearId}.`);

      const data = await imageServices.getImagesByYearId(yearId as string);
      return successResponse(res, 200, data, "Images retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageId } = req.params;
      if (!imageId) throw new BadRequestError("Provide an image ID.");

      const image = await imageServices.getImageById(imageId as string);
      if (!image)
        throw new NotFoundError(`Image not found with ID: ${imageId}.`);

      // Delete from ImageKit first
      await imageServices.deleteImage(image.publicId);

      const deleted = await imageServices.deleteImage(imageId as string);
      if (!deleted) throw new InternalError("Failed to delete image.");

      return successResponse(res, 200, deleted, "Image deleted successfully.");
    } catch (error) {
      next(error);
    }
  }

  async deleteImagesByQuestionId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { questionId } = req.params;
      if (!questionId) throw new BadRequestError("Provide a question ID.");

      const question = await questionServices.getQuestionById(
        questionId as string,
      );
      if (!question)
        throw new NotFoundError(`Question not found with ID: ${questionId}.`);

      const existingImages = await imageServices.getImagesByQuestionId(
        question.id,
      );

      if (existingImages.length > 0) {
        const fileIds = existingImages
          .map((img: Image) => img.publicId)
          .filter(Boolean);

        await imageServices.deleteMultipleImagesFromCloud(fileIds);
      }

      const deleted = await imageServices.deleteImagesByQuestionId(question.id);
      if (!deleted) throw new InternalError("Failed to delete images.");

      return successResponse(
        res,
        200,
        deleted,
        `${deleted.length} image(s) deleted successfully.`,
      );
    } catch (error) {
      next(error);
    }
  }
}

export const imageController = new ImageController();
