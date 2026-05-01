import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

export const levelNameEnum = pgEnum("level_name", [
  "Ordinary Level",
  "Advanced Level",
]);

export const levelSlugEnum = pgEnum("level_slug", ["o_level", "a_level"]);

export const levels = pgTable("levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: levelNameEnum("name").notNull(),
  slug: levelSlugEnum("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Level = typeof levels.$inferSelect;
export type NewLevel = typeof levels.$inferInsert;
