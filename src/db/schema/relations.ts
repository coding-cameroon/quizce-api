import { relations } from "drizzle-orm";
import { levels } from "./level.schema";
import { faculties } from "./faculty.schema";
import { subjects } from "./subject.schema";
import { years } from "./year.schema";
import { questions } from "./question.schema";
import { images } from "./image.schema";

export const levelsRelations = relations(levels, ({ many }) => ({
  faculties: many(faculties),
}));

export const facultiesRelations = relations(faculties, ({ one, many }) => ({
  level: one(levels, {
    fields: [faculties.levelId],
    references: [levels.id],
  }),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  faculty: one(faculties, {
    fields: [subjects.facultyId],
    references: [faculties.id],
  }),
  years: many(years),
}));

export const yearsRelations = relations(years, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [years.subjectId],
    references: [subjects.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  year: one(years, {
    fields: [questions.yearId],
    references: [years.id],
  }),
  images: many(images),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  question: one(questions, {
    fields: [images.questionId],
    references: [questions.id],
  }),
}));
