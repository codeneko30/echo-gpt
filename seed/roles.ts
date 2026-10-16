
const { db } = require("../db/connection");
const { roles } = require("../db/schema");

async function seedRoles() {
    try {
        const data = [{ name: "ADMIN" }, { name: "USER" }];
        const inserted = await db.insert(roles).values(data).onConflictDoNothing().returning();
        console.log("Roles seeded:", inserted.length);
    } catch (e) { console.error(e); }
}
seedRoles();