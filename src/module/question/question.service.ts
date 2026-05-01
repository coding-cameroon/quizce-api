import { db } from "@/config/db.js";
import {
  questions,
  type NewQuestion,
  type Question,
} from "@/db/schema/question.schema.js";
import { eq } from "drizzle-orm";

class QuestionServices {
  async createQuestions(data: NewQuestion[]): Promise<Question[]> {
    return await db.transaction(async (tx) => {
      return await tx.insert(questions).values(data).returning();
    });
  }

  async getAllQuestions(yearId?: string) {
    return await db.query.questions.findMany({
      where: yearId ? eq(questions.yearId, yearId) : undefined,
      with: {
        year: {
          with: {
            subject: { with: { faculty: { with: { level: true } } } },
          },
        },
        images: true,
      },
    });
  }

  async getQuestionById(id: string) {
    return await db.query.questions.findFirst({
      where: eq(questions.id, id),
      with: {
        year: {
          with: {
            subject: { with: { faculty: { with: { level: true } } } },
          },
        },
        images: true,
      },
    });
  }

  async getQuestionsByYearId(yearId: string) {
    return await db.query.questions.findMany({
      where: eq(questions.yearId, yearId),
      with: {
        year: {
          with: {
            subject: { with: { faculty: { with: { level: true } } } },
          },
        },
        images: true,
      },
    });
  }

  async deleteQuestion(id: string) {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(questions)
        .where(eq(questions.id, id))
        .returning();
      return deleted;
    });
  }

  async deleteQuestionsByYearId(yearId: string) {
    return await db.transaction(async (tx) => {
      return await tx
        .delete(questions)
        .where(eq(questions.yearId, yearId))
        .returning();
    });
  }
}

export const questionServices = new QuestionServices();
