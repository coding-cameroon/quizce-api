import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { levels } from "./level.schema.js";

export const facultyNameEnum = pgEnum("faculty_name", [
  "ARTS",
  "SCIENCE",
  "COMMERCIAL",
]);

export const faculties = pgTable("faculties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: facultyNameEnum("name").notNull(),
  levelId: uuid("level_id")
    .notNull()
    .references(() => levels.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Faculty = typeof faculties.$inferSelect;
export type NewFaculty = typeof faculties.$inferInsert;
