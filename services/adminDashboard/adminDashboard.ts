import { sql } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { users, chatHistory } from "../../db/schema.ts";

export async function getAdminDashboardStats() {
    const [usersCount] = await db
        .select({ count: sql`count(*)` })
        .from(users);

    const [chatsCount] = await db
        .select({ count: sql`count(*)` })
        .from(chatHistory);

    return {
        totalUsers: usersCount?.count ?? 0,
        totalChats: chatsCount?.count ?? 0,
        status: "OK",
    };
}