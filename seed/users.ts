

import { db } from "../db/connection.js";
import { users, roles } from "../db/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seedUsers() {

    const [userRole] = await db.select().from(roles).where(eq(roles.name, "USER"));

    if (!userRole) return;

    const hashed = bcrypt.hashSync("12345", 10);

    await db.insert(users).values([
        {
            email: "rose@echogpt.com",
            passwordHash: hashed,
            fullName: "Rose",
            roleId: userRole.id,
            isEmailVerified: true,
        },
        {
            email: "hena@echogpt.com",
            passwordHash: hashed,
            fullName: "Hena",
            roleId: userRole.id,
            isEmailVerified: true,
        },
        {
            email: "sun@echogpt.com",
            passwordHash: hashed,
            fullName: "Sun",
            roleId: userRole.id,
            isEmailVerified: true,
        },
    ]).onConflictDoNothing();

    console.log("Users seeded successfully.");
}

seedUsers();