import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "../../db/connection.ts";
import { users, roles, subscriptions } from "../../db/schema.ts";

export async function registerUser(
    email: string,
    password: string,
    fullName: string
) {
    const [userRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, "USER"));

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
        .insert(users)
        .values({
            email,
            passwordHash: hashedPassword,
            fullName,
            roleId: userRole.id
        })
        .returning();

    await db
        .insert(subscriptions)
        .values({
            userId: newUser.id,
            planType: "FREE",
            requestLimit: 50
        });

    return newUser;
}