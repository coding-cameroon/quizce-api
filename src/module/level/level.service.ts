import { eq } from "drizzle-orm";
import { db } from "@/config/db.js";
import { levels } from "@/db/schema";
import type { Level, NewLevel } from "@/db/schema/level.schema.js";

class LevelServices {
  // create level
  async createLevel(data: NewLevel): Promise<Level> {
    const [level] = await db.transaction(async (tx) => {
      return await tx.insert(levels).values(data).returning();
    });

    return level;
  }

  // get  all levels
  async getAllLevels(): Promise<Level[]> {
    const fetchedLevels = await db.select().from(levels);

    return fetchedLevels;
  }

  // get level by slug
  async getLevelBySlug(slug: "o_level" | "a_level"): Promise<Level> {
    const [level] = await db
      .select()
      .from(levels)
      .where(eq(levels.slug, slug))
      .limit(1);
    return level ?? null;
  }

  // get level by id
  async getLevel(id: string): Promise<Level> {
    const [level] = await db
      .select()
      .from(levels)
      .where(eq(levels.id, id))
      .limit(1);
    return level ?? null;
  }

  // delete level by id
  async deleteLevel(id: string): Promise<Level | undefined> {
    const [level] = await db.transaction(async (tx) => {
      return await tx.delete(levels).where(eq(levels.id, id)).returning();
    });

    return level;
  }

  // delete level by id
  async updateLevel(
    id: string,
    data: Partial<NewLevel>,
  ): Promise<Level | undefined> {
    const [level] = await db.transaction(async (tx) => {
      return await tx
        .update(levels)
        .set(data)
        .where(eq(levels.id, id))
        .returning();
    });

    return level;
  }
}

export const levelServices = new LevelServices();
