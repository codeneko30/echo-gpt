import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../../db/connection.ts";
import { users } from "../../db/schema.ts";

export async function changeUserPassword(userId: number, oldPassword: string, newPassword: string) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!oldPassword || !newPassword) {
        throw new Error("Old password and new password are required");
    }

    // ডেটাবেস থেকে ইউজার খুঁজে বের করা
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
        throw new Error("User not found");
    }

    // পুরনো পাসওয়ার্ড যাচাই করা
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Incorrect old password");
    }

    // নতুন পাসওয়ার্ড হ্যাশ করে ডেটাবেস আপডেট করা
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    await db
        .update(users)
        .set({ 
            passwordHash: newPasswordHash, 
            updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

    return { message: "Password changed successfully" };
}