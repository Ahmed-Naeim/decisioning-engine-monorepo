"use server";

import { GoogleGenAI } from "@google/genai";
import { getAllowedClaims } from "./claims";

const ai = new GoogleGenAI({
   apiKey: process.env.GEMINI_API_KEY || "dummy_api_key",
});

const FALLBACK_HEADLINE = "Supercharge Your Workflow Today";

export interface AIResponse {
   headline: string;
   claimId: string;
   status: "SUCCESS" | "RETRY_SUCCESS" | "FALLBACK";
   attemptCount: number;
}

export async function generateCopyAsync(
   promptContext: string,
   isRetry = false,
   attemptCount = 1,
): Promise<AIResponse> {
   const claims = getAllowedClaims();
   const claimsJson = JSON.stringify(claims);

   let promptText = `You are a professional copywriter.
Profile context: "${promptContext}"
You MUST pick ONE claim ID from this exact list and write a creative 5-word headline combining the user context and the selected claim truth.
Allowed Claims: ${claimsJson}

Return ONLY a JSON object:
{
  "headline": "your generated short headline",
  "claimId": "the literal ID string of the claim you used"
}`;

   if (isRetry) {
      promptText = `Error: You used an invalid Claim ID. Please only use IDs from the provided list.
Profile context: "${promptContext}"
Allowed Claims: ${claimsJson}
Return ONLY a JSON object:
{"headline": "...", "claimId": "..."}`;
   }

   try {
      const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: promptText,
      });

      // Parse safely
      let resultText = response.text || "{}";
      // Sometimes LLM returns markdown blocks around JSON.
      if (resultText.includes("```json")) {
         resultText = resultText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
      }
      const result = JSON.parse(resultText);

      const isValidClaim = claims.some((c) => c.id === result.claimId);

      if (isValidClaim) {
         return {
            headline: result.headline,
            claimId: result.claimId,
            status: isRetry ? "RETRY_SUCCESS" : "SUCCESS",
            attemptCount,
         };
      } else if (!isRetry) {
         // EXACTLY ONE recursive retry
         console.log("Invalid claim ID generated. Initiating 1 retry...");
         return generateCopyAsync(promptContext, true, attemptCount + 1);
      } else {
         // Failed again
         return {
            headline: FALLBACK_HEADLINE,
            claimId: "fallback",
            status: "FALLBACK",
            attemptCount,
         };
      }
   } catch (e) {
      console.error("LLM Error:", e);
      if (!isRetry) {
         return generateCopyAsync(promptContext, true, attemptCount + 1);
      }
      return {
         headline: FALLBACK_HEADLINE,
         claimId: "fallback",
         status: "FALLBACK",
         attemptCount,
      };
   }
}
