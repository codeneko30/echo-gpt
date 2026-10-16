import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { users } from "../../db/schema.ts";

export async function getUserProfile(userId: number) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
        })
        .from(users)
        .where(eq(users.id, userId));

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}