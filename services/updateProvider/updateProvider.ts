import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { aiProviders } from "../../db/schema.ts";

export async function updateProvider(providerId: number, apiKey?: string, isActive?: boolean) {
    if (!providerId) {
        throw new Error("Provider ID is required");
    }

    await db
        .update(aiProviders)
        .set({ 
            ...(apiKey !== undefined && { apiKey }), 
            ...(isActive !== undefined && { isActive }), 
            updatedAt: new Date() 
        })
        .where(eq(aiProviders.id, providerId));

    return { message: "Provider updated successfully" };
}