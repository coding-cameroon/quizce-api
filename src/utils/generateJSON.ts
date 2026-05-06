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
      text: `Act as a document data extractor. I will provide a PDF containing exam questions. Your task is to parse every question and return a valid JSON array.

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
1. **Strict LaTeX**: Use LaTeX for ALL mathematical expressions, symbols, and equations.
2. **Double-Escape Requirement**: Because the output is a JSON string, you MUST use double backslashes for all LaTeX commands (e.g., use \\\\frac{a}{b}, \\\\sqrt{x}, \\\\sum, \\\\int). A single backslash will make the JSON invalid and cause rendering errors.
3. **Delimiters**: 
   - Use $ for inline math (e.g., $x^2 + 1$).
   - Use $$ for block/display math (e.g., $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$).

### EXTRACTION RULES:
1. Extract ONLY the first 50 multiple-choice questions. Ignore structural/essay questions entirely.
2. **Options**: Must be plain text strings ONLY. Remove any "A.", "B.", "C.", or "D." prefixes from the option text.
3. **correctOption**: A string representing the zero-based index of the correct answer ("0" for A, "1" for B, "2" for C, "3" for D).
4. **imageType**: Must be "none" or "question_image" only.
5. **explanation**: Must be detailed. For math problems, show the full step-by-step derivation using properly escaped LaTeX (double backslashes).
6. **yearId**: Must always be an empty string "".
7. **Format**: Return ONLY the raw JSON array. NO markdown (no \`\`\`json tags), NO preamble, and NO conversational text.

### EXAMPLE OUTPUT:
[
  {
    "number": 1,
    "question": "Evaluate the integral $$\\int_{1}^{2} \\\\frac{1}{x} dx$$",
    "options": ["ln 2", "ln 3", "1", "0"],
    "imageType": "none",
    "correctOption": "0",
    "explanation": "The integral of $$\\frac{1}{x}$$ is $$\\ln|x|$$. Evaluating from 1 to 2 gives $$\\ln 2 - \\ln 1 = \\ln 2 - 0 = \\ln 2$$.",
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
