import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { aiProviders } from "../../db/schema.ts";

export async function deleteProvider(providerId: number) {
    if (!providerId) {
        throw new Error("Provider ID is required");
    }

    await db
        .delete(aiProviders)
        .where(eq(aiProviders.id, providerId));

    return { message: "Provider deleted successfully" };
}