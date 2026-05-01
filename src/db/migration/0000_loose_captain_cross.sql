CREATE TYPE "public"."faculty_name" AS ENUM('ARTS', 'SCIENCE', 'COMMERCIAL');--> statement-breakpoint
CREATE TYPE "public"."level_name" AS ENUM('Ordinary Level', 'Advanced Level');--> statement-breakpoint
CREATE TYPE "public"."level_slug" AS ENUM('o_level', 'a_level');--> statement-breakpoint
CREATE TYPE "public"."image_type" AS ENUM('none', 'question_image', 'option_images');--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "faculty_name" NOT NULL,
	"level_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"public_id" text NOT NULL,
	"option_index" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "level_name" NOT NULL,
	"slug" "level_slug" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "levels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"faculty_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text,
	"options" text[] NOT NULL,
	"image_type" "image_type" DEFAULT 'none' NOT NULL,
	"number" integer NOT NULL,
	"correct_option" text NOT NULL,
	"explanation" text NOT NULL,
	"year_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "years" ADD CONSTRAINT "years_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_year_id_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."years"("id") ON DELETE cascade ON UPDATE no action;