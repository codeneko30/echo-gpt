import { db } from "../../db/connection.ts";
import { apiUsageLogs } from "../../db/schema.ts";

export async function getAdminApiLogs() {
    const logs = await db
        .select()
        .from(apiUsageLogs)
        .limit(50);

    return logs;
}