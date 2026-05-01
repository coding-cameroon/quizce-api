import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { questions } from "./question.schema";

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  publicId: text("public_id").notNull(),
  optionIndex: integer("option_index"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
