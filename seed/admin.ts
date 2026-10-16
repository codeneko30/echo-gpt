
const { db } = require("../db/connection");
const { users, roles } = require("../db/schema");
const bcrypt = require("bcryptjs");
const { eq } = require("drizzle-orm");

async function seedAdmin() {
    try {
        const [adminRole] = await db.select().from(roles).where(eq(roles.name, "ADMIN"));
        if (!adminRole) return console.log("Run roles seed first!");

        const hashed = await bcrypt.hash("Admin@12345", 10);
        const [admin] = await db.insert(users).values({
            email: "admin@echogpt.com",
            passwordHash: hashed,
            fullName: "System Admin",
            roleId: adminRole.id,
            isEmailVerified: true,
        }).onConflictDoNothing().returning();

        console.log("Admin seeded:", admin ? admin.email : "Already exists");
    } catch (e) { console.error(e); }
}
seedAdmin();