import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { chatHistory } from "../../db/schema.ts";

export async function getUserChatHistory(userId: number) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const history = await db
        .select()
        .from(chatHistory)
        .where(eq(chatHistory.userId, userId));

    return history;
}