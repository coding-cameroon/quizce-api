import { db } from "@/config/db.js";
import { years, type NewYear, type Year } from "@/db/schema/year.schema.js";
import { eq } from "drizzle-orm";

class YearServices {
  async createYears(
    yearNames: string[],
    subjectId: string,
    yearLevel: string,
  ): Promise<Year[]> {
    return await db.transaction(async (tx) => {
      const values: NewYear[] = yearNames.map((yr) => ({
        name: `GCE June ${yearLevel} - ${yr}`,
        subjectId,
      }));

      return await tx.insert(years).values(values).returning();
    });
  }

  async getAllYears() {
    return await db.query.years.findMany({
      with: { subject: { with: { faculty: { with: { level: true } } } } },
    });
  }

  async getYearById(id: string) {
    return await db.query.years.findFirst({
      where: eq(years.id, id),
      with: { subject: { with: { faculty: { with: { level: true } } } } },
    });
  }

  async getYearsBySubjectId(subjectId: string) {
    return await db.query.years.findMany({
      where: eq(years.subjectId, subjectId),
      with: { subject: { with: { faculty: { with: { level: true } } } } },
    });
  }

  async updateYear(id: string, data: Partial<NewYear>) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(years)
        .set(data)
        .where(eq(years.id, id))
        .returning();
      return updated;
    });
  }

  async deleteYear(id: string) {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(years)
        .where(eq(years.id, id))
        .returning();
      return deleted;
    });
  }
}

export const yearServices = new YearServices();
