import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { subjects } from "./subject.schema";

export const years = pgTable("years", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Year = typeof years.$inferSelect;
export type NewYear = typeof years.$inferInsert;
