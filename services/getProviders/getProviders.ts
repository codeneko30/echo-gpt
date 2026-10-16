import { db } from "../../db/connection.ts";
import { aiProviders } from "../../db/schema.ts";

export async function getAllProviders() {
    const list = await db
        .select()
        .from(aiProviders);

    return list;
}