import { GoogleGenAI } from "@google/genai";

import { logger } from "@/logger/logger.js";
import { GEMINI_API_KEY } from "@/config/env.js";

import { InternalError } from "@/errors/AppError";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateJSON = async function (file: {
  buffer: Buffer;
  mimeType: string;
}) {
  logger.info("GENERATE PDF STARTED...");

  const blob = new Blob([file.buffer as any], {
    type: file.mimeType,
  });

  const myfile = await ai.files.upload({
    file: blob,
    config: { mimeType: file.mimeType },
  });

  logger.info("File uploaded successfully:", myfile.name);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      config: {
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [
            { fileData: { fileUri: myfile.uri, mimeType: myfile.mimeType } },
            {
              text: `Act as a document data extractor. I will provide a PDF containing exam questions.
                Your task is to parse every question and return a valid JSON array.

                ### DATA SCHEMA:
                Each object in the array must strictly follow this structure:
                {
                "number": number,          // The question number as found in the document
                "question": string | null, // The full text of the question. Set to null ONLY if the question is entirely image-based with no text at all
                "options": string[],       // Array of exactly 4 text options. Never use labels like "A." or "1." — just the raw option text
                "imageType": "none" | "question_image", // "question_image" if the question references a diagram, figure, table or graph. Otherwise "none". Never use "option_images"
                "correctOption": string,   // Zero-based index of the correct answer as a string ("0", "1", "2", or "3")
                "explanation": string,     // Detailed step-by-step explanation of why the answer is correct
                "yearId": ""               // Always leave as empty string
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
                        "explanation": "When price is above equilibrium, quantity supplied exceeds quantity demanded, resulting in a surplus. Producers are incentivized by high prices to produce more, while consumers demand less at higher prices.",
                        "yearId": ""
                    },
                    {
                        "number": 2,
                        "question": null,
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "imageType": "question_image",
                        "correctOption": "2",
                        "explanation": "Based on the diagram shown, ...",
                        "yearId": ""
                    }
                ]`,
            },
          ],
        },
      ],
    });

    logger.info("GENERATE PDF FINISH...");

    if (!response.text) throw new InternalError("Empty response from Gemini");

    try {
      return JSON.parse(response.text);
    } catch {
      throw new InternalError("Failed to parse Gemini response as JSON");
    }
  } catch (error) {
    logger.error("Error during AI processing:", error);
    throw error;
  } finally {
    await ai.files.delete({ name: myfile.name as string });
  }
};
