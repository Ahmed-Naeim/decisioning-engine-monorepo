"use server";

export async function getApiUrl(): Promise<string> {
   // NEXT_PUBLIC_API_URL is available to the server at runtime via Docker environment variables
   return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}
