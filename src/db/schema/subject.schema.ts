import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { faculties } from "./faculty.schema";

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  facultyId: uuid("faculty_id")
    .notNull()
    .references(() => faculties.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
