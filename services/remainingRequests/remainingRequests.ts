import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { subscriptions } from "../../db/schema.ts";

export async function getRemainingRequests(userId: number) {
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

    // অবশিষ্ট রিকোয়েস্টের হিসাব করা
    const remaining = (sub.requestLimit || 0) - (sub.requestsUsed || 0);

    return { remaining };
}