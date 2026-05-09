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
1. Use LaTeX for ALL mathematical expressions, symbols, and equations.
2. CRITICAL JSON ESCAPING RULE: In a JSON string, a single backslash must be written as two backslashes. So LaTeX command \\frac must be written as \\\\frac in the JSON output. This is standard JSON escaping.
3. Inline math: wrap in single dollar signs e.g. $x^2 + 1$.
4. Block math: wrap in double dollar signs e.g. $$\\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}$$.
5. Correct examples (as they must appear in the raw JSON string):
   - Fraction: "$$\\\\frac{1}{x}$$"
   - Square root: "$\\\\sqrt{x}$"
   - Integral: "$$\\\\int_{1}^{2} \\\\frac{1}{x} dx$$"
   - Log: "$\\\\log_{x} y$"
   - Greek: "$\\\\alpha$", "$\\\\beta$", "$\\\\theta$", "$\\\\pi$", "$\\\\lambda$", "$\\\\mu$"
   - Trig: "$\\\\sin \\\\theta$", "$\\\\cos \\\\theta$", "$\\\\tan \\\\theta$"
   - Sets: "$A \\\\cap B$", "$A \\\\cup B$", "$\\\\mathbb{R}$"
   - Arrows: "$\\\\rightarrow$", "$\\\\Rightarrow$", "$\\\\to$", "$\\\\infty$"
   - Vectors: "$\\\\mathbf{i}$", "$\\\\mathbf{j}$", "$\\\\mathbf{k}$"
   - Matrix row separator: use \\\\\\\\ (four backslashes in JSON = two backslashes = LaTeX newline)
   - Matrix: "$$\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}$$"
   - Limit: "$\\\\lim_{x \\\\to 0}$"
   - Sum: "$\\\\sum_{i=1}^{n}$"
   - Absolute value: "$\\\\left| x \\\\right|$"
   - Power/superscript: "$x^{2}$", "$e^{x}$"
   - Subscript: "$x_{1}$", "$a_{n}$"

### EXTRACTION RULES:
1. Extract ONLY the first 50 multiple-choice questions. Ignore structural/essay questions entirely.
2. Options must always be plain text strings. Remove any "A.", "B.", "C.", or "D." prefixes. Apply the same JSON escaping rules if options contain LaTeX.
3. correctOption is the zero-based index of the correct answer as a string ("0" for A, "1" for B, "2" for C, "3" for D). If not determinable, use "".
4. imageType is ONLY "none" or "question_image". Use "question_image" if the question references a diagram, figure, table or graph.
5. explanation must be detailed with full step-by-step working. For math problems show the full derivation with correctly escaped LaTeX.
6. yearId must always be an empty string "".
7. Return ONLY the raw JSON array — no markdown, no code blocks, no preamble, no trailing text.

### EXAMPLE OUTPUT (showing exact raw JSON with correct escaping):
[
  {
    "number": 1,
    "question": "Evaluate the integral $$\\\\int_{1}^{2} \\\\frac{1}{x} dx$$",
    "options": ["ln 2", "ln 3", "1", "0"],
    "imageType": "none",
    "correctOption": "0",
    "explanation": "The integral of $\\\\frac{1}{x}$ is $\\\\ln|x|$. Evaluating from 1 to 2: $$\\\\ln 2 - \\\\ln 1 = \\\\ln 2 - 0 = \\\\ln 2$$.",
    "yearId": ""
  },
  {
    "number": 2,
    "question": "If $\\\\log_{x} y = 2$ and $xy = 125$, find $x$ and $y$.",
    "options": ["3 and 9", "9 and 3", "5 and 25", "25 and 5"],
    "imageType": "none",
    "correctOption": "2",
    "explanation": "$\\\\log_x y = 2 \\\\Rightarrow y = x^2$. Substituting into $xy = 125$: $x \\\\cdot x^2 = x^3 = 125$, so $x = 5$ and $y = 5^2 = 25$.",
    "yearId": ""
  },
  {
    "number": 3,
    "question": null,
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "imageType": "question_image",
    "correctOption": "1",
    "explanation": "Based on the diagram shown, the correct answer is B because...",
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
    // Gemini sometimes outputs single backslashes which are invalid JSON
    // Fix by doubling all backslashes then parse again
    try {
      const fixed = clean.replace(/\\(?!\\)/g, "\\\\");
      return JSON.parse(fixed);
    } catch {
      throw new InternalError("Failed to parse Gemini response as JSON");
    }
  }
};