import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { years } from "./year.schema";

export const imageTypeEnum = pgEnum("image_type", [
  "none",
  "question_image",
  "option_images",
]);

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question"),
  options: text("options").array().notNull(),
  imageType: imageTypeEnum("image_type").notNull().default("none"),
  number: integer("number").notNull(),
  correctOption: text("correct_option").notNull(),
  explanation: text("explanation").notNull(),
  yearId: uuid("year_id")
    .notNull()
    .references(() => years.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
