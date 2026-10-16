import { db } from "../../db/connection.ts";
import { users } from "../../db/schema.ts";

export async function getAllUsersForAdmin() {
    const allUsers = await db
        .select()
        .from(users);

    return allUsers;
}