import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { users } from "../../db/schema.ts";

export async function updateUserProfile(userId: number, fullName: string) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!fullName || fullName.trim() === "") {
        throw new Error("Full name is required");
    }

    // ডেটাবেসে প্রোফাইল আপডেট করা
    await db
        .update(users)
        .set({ 
            fullName, 
            updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

    return { message: "Profile updated successfully" };
}