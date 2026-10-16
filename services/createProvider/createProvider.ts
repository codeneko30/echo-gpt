import { db } from "../../db/connection.ts";
import { aiProviders } from "../../db/schema.ts";

export async function createProvider(
    providerName: string,
    apiKey: string,
    isDefault: boolean = false,
    isActive: boolean = true
) {
    if (!providerName || !providerName.trim()) {
        throw new Error("Provider name is required");
    }
    if (!apiKey || !apiKey.trim()) {
        throw new Error("API key is required");
    }

    const [newProvider] = await db
        .insert(aiProviders)
        .values({
            providerName,
            apiKey,
            isDefault,
            isActive,
        })
        .returning();

    return newProvider;
}