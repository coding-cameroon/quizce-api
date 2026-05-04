import { db } from "@/config/db.js";
import { NewFaculty, Faculty, faculties } from "@/db/schema/faculty.schema.js";
import { and, eq } from "drizzle-orm";

class FacultyServices {
  // create faculty
  async createFaculty(data: NewFaculty): Promise<Faculty | undefined> {
    const [faculty] = await db.transaction(async (tx) => {
      return await tx.insert(faculties).values(data).returning();
    });

    // return faculty;
    return await this.getFacultyById(faculty.id);
  }

  //   get all faculties
  async getAllFaculties(): Promise<Faculty[]> {
    return await db.query.faculties.findMany({
      with: {
        level: true,
        subjects: true,
      },
    });
  }

  // Get a single faculty by its ID with relations
  async getFacultyById(id: string) {
    return await db.query.faculties.findFirst({
      where: eq(faculties.id, id),
      with: {
        level: true,
        subjects: true,
      },
    });
  }

  // Get faculties by levelId with relations
  // Note: findMany is used here as a level likely has multiple faculties
  async getFacultiesByLevelId(levelId: string) {
    return await db.query.faculties.findMany({
      where: eq(faculties.levelId, levelId),
      with: {
        level: true,
        subjects: true,
      },
    });
  }

  //   check faculty exist
  async checkfacultyExist({
    name,
    levelId,
  }: {
    name: "ARTS" | "SCIENCE" | "COMMERCIAL";
    levelId: string;
  }): Promise<Faculty | undefined> {
    return await db.query.faculties.findFirst({
      where: (faculties, { and, eq }) =>
        and(eq(faculties.name, name), eq(faculties.levelId, levelId)),
    });
  }

  //   delete faculty
  async deleteFaculty(id: string): Promise<Faculty> {
    const [faculty] = await db.transaction(async (tx) => {
      return await tx.delete(faculties).where(eq(faculties.id, id)).returning();
    });

    return faculty;
  }

  // update faculty
  async updateFaculty(id: string, data: Partial<NewFaculty>): Promise<Faculty> {
    const [faculty] = await db.transaction(async (tx) => {
      return await tx
        .update(faculties)
        .set(data)
        .where(eq(faculties.id, id))
        .returning();
    });

    return faculty;
  }
}

export const facultyServices = new FacultyServices();
