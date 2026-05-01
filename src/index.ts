// PACKAGE IMPORTS
import cors from "cors";
import express from "express";
import type { CorsOptions } from "cors";
import type { Request, Response, Application } from "express";

// CONFIGS
import { connectDB } from "./config/db.js";
import { PORT } from "./config/env.js";

// ROUTES
import { yearRouter } from "./module/year/year.route.js";
import { imageRouter } from "./module/media/image.route.js";
import { levelRouter } from "./module/level/level.route.js";
import { subjectRouter } from "./module/subject/subject.route.js";
import { facultyRouter } from "./module/faculty/faculty.route.js";
import { questionRouter } from "./module/question/question.route.js";

// MIDDLEWARES
import { globalErrorHandler } from "@/middleware/error.middleware.js";
import { logger } from "./logger/logger.js";

const app: Application = express();
const corsOptions: CorsOptions = {
  origin: "*",
  credentials: true,
  allowedHeaders: ["Content-Type"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (_: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Server running.",
  });
});

// routes
app.use("/ap1/v1/years", yearRouter);
app.use("/ap1/v1/images", imageRouter);
app.use("/ap1/v1/levels", levelRouter);
app.use("/ap1/v1/subjects", subjectRouter);
app.use("/ap1/v1/faculties", facultyRouter);
app.use("/ap1/v1/questions", questionRouter);

// error middleware
app.use(globalErrorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT || 5500, () => {
      logger.info(`Server running on http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error("[SERVER] Failed to start server");
  }
};

await startServer();
