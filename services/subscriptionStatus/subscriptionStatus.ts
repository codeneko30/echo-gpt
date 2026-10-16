import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { subscriptions } from "../../db/schema.ts";

export async function getUserSubscriptionStatus(userId: number) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

    if (!sub) {
        throw new Error("Subscription not found");
    }

    return sub;
}