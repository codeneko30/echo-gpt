import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { webSearches } from "../../db/schema.ts";

export async function getUserSearchHistory(userId: number) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const history = await db
        .select()
        .from(webSearches)
        .where(eq(webSearches.userId, userId));

    return history;
}