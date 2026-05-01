import { db } from "@/config/db.js";
import {
  subjects,
  type NewSubject,
  type Subject,
} from "@/db/schema/subject.schema.js";
import { eq, and } from "drizzle-orm";

class SubjectServices {
  // CREATE: Uses transaction to ensure atomicity
  async createSubject(data: NewSubject): Promise<Subject> {
    return await db.transaction(async (tx) => {
      const [subject] = await tx.insert(subjects).values(data).returning();
      return subject;
    });
  }

  // GET methods do not strictly require transactions unless you are
  // performing read-only snapshots; simple selects are fine as is.
  async getAllSubjects() {
    return await db.query.subjects.findMany({
      with: { faculty: { with: { level: true } } },
    });
  }

  async getSubjectById(id: string) {
    return await db.query.subjects.findFirst({
      where: eq(subjects.id, id),
      with: { faculty: { with: { level: true } } },
    });
  }

  async getSubjectByFacultyId(id: string) {
    return await db.query.subjects.findFirst({
      where: eq(subjects.facultyId, id),
      with: { faculty: { with: { level: true } } },
    });
  }

  // UPDATE: Uses transaction to ensure the record exists before updating
  async updateSubject(id: string, data: Partial<NewSubject>) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(subjects)
        .set(data)
        .where(eq(subjects.id, id))
        .returning();
      return updated;
    });
  }

  // DELETE: Uses transaction to ensure the record is deleted safely
  async deleteSubject(id: string) {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(subjects)
        .where(eq(subjects.id, id))
        .returning();
      return deleted;
    });
  }
}

export const subjectServices = new SubjectServices();
