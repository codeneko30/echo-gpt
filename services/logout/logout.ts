import { eq } from "drizzle-orm";

import { db } from "../../db/connection.ts";
import { sessions } from "../../db/schema.ts";

export async function logoutUser(userId: number) {
    await db
        .delete(sessions)
        .where(eq(sessions.userId, userId));
}