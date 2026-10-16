import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { users } from "../../db/schema.ts";

export async function deleteUserAccount(userId: number) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    // ডেটাবেস থেকে ইউজার ডিলিট করা
    await db
        .delete(users)
        .where(eq(users.id, userId));

    return { message: "Account deleted successfully" };
}