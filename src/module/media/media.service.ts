import crypto from "crypto";
import { db } from "@/config/db.js";
import { imageKit } from "@/config/imageKit.js";
import { images, type NewImage, type Image } from "@/db/schema/image.schema.js";
import { eq } from "drizzle-orm";

type UploadFolder = "questions";

interface UploadResult {
  url: string;
  fileId: string;
}

class ImageServices {
  // -------------------------
  // IMAGEKIT CLOUD OPERATIONS
  // -------------------------

  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadResult> {
    const response = await imageKit.upload({
      file: file.buffer,
      fileName: `${crypto.randomBytes(32).toString("hex")}_${file.originalname}`,
      folder: `/campulse/${folder}`,
    });

    return {
      url: response.url,
      fileId: response.fileId,
    };
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: UploadFolder,
  ): Promise<UploadResult[]> {
    return await Promise.all(
      files.map((file) => this.uploadImage(file, folder)),
    );
  }

  async deleteImageFromCloud(fileId: string): Promise<void> {
    await imageKit.deleteFile(fileId);
  }

  async deleteMultipleImagesFromCloud(fileIds: string[]): Promise<void> {
    if (!fileIds || fileIds.length === 0) return;
    await imageKit.bulkDeleteFiles(fileIds);
  }

  // -------------------------
  // DATABASE OPERATIONS
  // -------------------------

  async createImages(data: NewImage[]): Promise<Image[]> {
    return await db.transaction(async (tx) => {
      return await tx.insert(images).values(data).returning();
    });
  }

  async getAllImages() {
    return await db.query.images.findMany({
      with: {
        question: {
          with: {
            year: {
              with: {
                subject: { with: { faculty: { with: { level: true } } } },
              },
            },
          },
        },
      },
    });
  }

  async getImageById(id: string) {
    return await db.query.images.findFirst({
      where: eq(images.id, id),
      with: {
        question: {
          with: {
            year: {
              with: {
                subject: { with: { faculty: { with: { level: true } } } },
              },
            },
          },
        },
      },
    });
  }

  async getImagesByQuestionId(questionId: string) {
    return await db.query.images.findMany({
      where: eq(images.questionId, questionId),
      with: {
        question: {
          with: {
            year: {
              with: {
                subject: { with: { faculty: { with: { level: true } } } },
              },
            },
          },
        },
      },
    });
  }

  async getImagesByYearId(yearId: string) {
    return await db.query.images
      .findMany({
        with: {
          question: {
            with: {
              year: {
                with: {
                  subject: { with: { faculty: { with: { level: true } } } },
                },
              },
            },
          },
        },
      })
      .then((imgs: any) =>
        imgs.filter((img: any) => img.question.yearId === yearId),
      );
  }

  async deleteImage(id: string) {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(images)
        .where(eq(images.id, id))
        .returning();
      return deleted;
    });
  }

  async deleteImagesByQuestionId(questionId: string) {
    return await db.transaction(async (tx) => {
      return await tx
        .delete(images)
        .where(eq(images.questionId, questionId))
        .returning();
    });
  }
}

export const imageServices = new ImageServices();
