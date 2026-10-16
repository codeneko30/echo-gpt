import { db } from "../../db/connection.ts";
import { webSearches } from "../../db/schema.ts";

export async function performWebSearch(userId: number, query: string) {
    if (!query || typeof query !== "string" || !query.trim()) {
        throw new Error("Search query is required");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }

    const trimmedQuery = query.trim();
    const results = [{ title: `Search result for ${trimmedQuery}`, snippet: "Sample snippet." }];

    await db.insert(webSearches).values({
        userId,
        query: trimmedQuery,
        results,
    });

    return { query: trimmedQuery, results };
}