import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { subscriptions } from "../../db/schema.ts";

export async function upgradeUserSubscription(userId: number, planType: string) {
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!planType) {
        throw new Error("Plan type is required");
    }

    await db
        .update(subscriptions)
        .set({ 
            planType, 
            requestLimit: 1000, 
            updatedAt: new Date() 
        })
        .where(eq(subscriptions.userId, userId));

    return { message: "Subscription upgraded successfully" };
}