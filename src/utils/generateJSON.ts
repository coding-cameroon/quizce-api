import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { logger } from "@/logger/logger.js";
import { GEMINI_API_KEY } from "@/config/env.js";
import { InternalError } from "@/errors/AppError.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export const generateJSON = async function (file: {
  buffer: Buffer;
  mimeType: string;
}) {
  logger.info("GENERATE PDF STARTED...");

  // Use the latest model version for best reasoning and JSON adherence
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // Force the model to output valid JSON structure
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const base64Data = file.buffer.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Data,
        mimeType: file.mimeType,
      },
    },
    {
      text: `Act as a high-precision document data extractor for Cameroonian GCE exams. Your goal is to parse every question from the provided PDF and return a strictly valid JSON array.

### EXTRACTION GOAL:
1. Extract ONLY the first 50 Multiple Choice Questions (MCQs). 
2. If a question is missing or contains only a diagram, use "question": null and "imageType": "question_image".
3. Provide step-by-step mathematical reasoning in the "explanation" field.

### STRICT JSON ESCAPING PROTOCOL:
You are generating a RAW JSON STRING. In JSON, the backslash (\) is an escape character. 
- To produce a LaTeX command like \\frac, you MUST write it as \\\\frac in the JSON.
- For a LaTeX newline (\\\\), you MUST write it as \\\\\\\\ in the JSON.
- FAILURE TO DOUBLE-ESCAPE BACKSLASHES WILL BREAK THE PARSER.

### DATA SCHEMA:
Return an array of objects:
{
  "number": number,
  "question": string | null,
  "options": string[],
  "imageType": "none" | "question_image",
  "correctOption": string (0-3),
  "explanation": string,
  "yearId": ""
}

### LaTeX RENDERING RULES:
- Inline: $x^2$ (written as "$x^{2}$" in JSON)
- Block: $$\\\\frac{a}{b}$$ (written as "$$\\\\\\\\frac{a}{b}$$" in JSON)
- Greek/Symbols: \\\\alpha, \\\\beta, \\\\lambda, \\\\mu, \\\\theta, \\\\pi, \\\\Sigma, \\\\infty, \\\\rightarrow, \\\\Rightarrow
- Vectors: \\\\mathbf{i}, \\\\mathbf{j}, \\\\mathbf{k}
- Sets: \\\\mathbb{R}, \\\\cap, \\\\cup, \\\\setminus

### QUALITY CHECK:
- Remove "A.", "B.", "C.", "D." prefixes from options.
- The "correctOption" must be a string representing the index ("0" for A, "1" for B, etc.).
- Ensure no trailing commas in the JSON array.
- Take your time to ensure the mathematical derivations in the "explanation" are 100% accurate.

### EXAMPLE OF CORRECTLY ESCAPED JSON:
[
  {
    "number": 1,
    "question": "Find $g \\\\\\\\circ f(2)$ if $f(x) = x^{2}-1$ and $g(x) = 2x+1$.",
    "options": ["11", "7", "24", "13"],
    "imageType": "none",
    "correctOption": "1",
    "explanation": "First, calculate $f(2) = 2^{2}-1 = 3$. Then $g(3) = 2(3)+1 = 7$.",
    "yearId": ""
  }
]`,
    },
  ]);

  logger.info("GENERATE PDF FINISH...");

  const text = result.response.text();
  if (!text) throw new InternalError("Empty response from Gemini");

  // Since we used responseMimeType: "application/json",
  // we usually don't need to strip markdown, but we do it for safety.
  const clean = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    logger.error("Initial JSON parse failed, attempting backslash recovery...");
    try {
      // Regex to fix single backslashes that aren't already escaped
      const fixed = clean.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
      return JSON.parse(fixed);
    } catch (finalError) {
      logger.error("Final JSON Parse Error:", clean);
      throw new InternalError(
        "Failed to parse Gemini response as JSON even after recovery.",
      );
    }
  }
};
