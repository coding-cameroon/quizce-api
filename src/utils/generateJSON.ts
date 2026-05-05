import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/logger/logger.js";
import { GEMINI_API_KEY } from "@/config/env.js";
import { InternalError } from "@/errors/AppError.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export const generateJSON = async function (file: {
  buffer: Buffer;
  mimeType: string;
}) {
  logger.info("GENERATE PDF STARTED...");

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const base64Data = file.buffer.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Data,
        mimeType: file.mimeType,
      },
    },
    {
      text: `Act as a document data extractor. I will provide a PDF containing exam questions.
Your task is to parse every question and return a valid JSON array.

### DATA SCHEMA:
Each object in the array must strictly follow this structure:
{
  "number": number,
  "question": string | null,
  "options": string[],
  "imageType": "none" | "question_image",
  "correctOption": string,
  "explanation": string,
  "yearId": ""
}

### MATHEMATICAL RENDERING (LaTeX):
1. Use LaTeX for ALL mathematical expressions, symbols, and equations.
2. In JSON strings, use double backslashes for LaTeX commands (e.g., "\\frac" not "\frac").
3. Inline math: wrap in single dollar signs e.g. $x^2 + 1$.
4. Block math: wrap in double dollar signs e.g. $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$.

### EXTRACTION RULES:
1. Extract ONLY the first 50 multiple choice questions. Ignore structural/essay questions entirely.
2. Options must always be plain text strings — never images, never labeled with A/B/C/D.
3. correctOption is the zero-based index of the correct answer ("0" for A, "1" for B, "2" for C, "3" for D).
4. imageType is ONLY "none" or "question_image" — never "option_images".
5. explanation must be detailed. For math problems, show full derivation using LaTeX.
6. yearId must always be an empty string "".
7. Return ONLY the raw JSON array — no markdown, no code blocks, no preamble.

### EXAMPLE OUTPUT:
[
  {
    "number": 1,
    "question": "Which of the following occurs when price is above equilibrium?",
    "options": ["Shortage", "Surplus", "Market Clearing", "Increase in Demand"],
    "imageType": "none",
    "correctOption": "1",
    "explanation": "When price is above equilibrium, quantity supplied exceeds quantity demanded.",
    "yearId": ""
  }
]`,
    },
  ]);

  logger.info("GENERATE PDF FINISH...");

  const text = result.response.text();
  if (!text) throw new InternalError("Empty response from Gemini");

  // Strip markdown code blocks if present
  const clean = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new InternalError("Failed to parse Gemini response as JSON");
  }
};
