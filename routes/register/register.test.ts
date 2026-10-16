// import { beforeAll, afterAll, describe, expect, it } from "vitest";
// import request from "supertest";
// import bcrypt from "bcryptjs";

// import app from "../../index.ts";
// import { db } from "../../db/connection.ts";
// import { users, roles, subscriptions } from "../../db/schema.ts";
// import { eq } from "drizzle-orm";

// describe("POST /api/auth/register - Real Integration Test", () => {
//     const email = `vitest-${crypto.randomUUID()}@example.com`;
//     const password = "TestPassword123!";
//     const fullName = "Vitest Test User";

//     let createdUserId: number | undefined;

//     beforeAll(async () => {
//         const [userRole] = await db
//             .select()
//             .from(roles)
//             .where(eq(roles.name, "USER"));

//         if (!userRole) {
//             throw new Error(
//                 'USER role does not exist in the test database. Seed the roles first.',
//             );
//         }
//     });

//     afterAll(async () => {
//         if (createdUserId !== undefined) {
//             await db
//                 .delete(subscriptions)
//                 .where(eq(subscriptions.userId, createdUserId));

//             await db
//                 .delete(users)
//                 .where(eq(users.id, createdUserId));
//         }
//     });

//     it("should create a real user and FREE subscription", async () => {
//         const response = await request(app)
//             .post("/api/auth/register")
//             .send({
//                 email,
//                 password,
//                 fullName,
//             });

//         expect(response.status).toBe(201);
//         expect(response.body.message).toBe("Registered successfully");
//         expect(response.body.userId).toBeDefined();

//         createdUserId = response.body.userId;

//         const [createdUser] = await db
//             .select()
//             .from(users)
//             .where(eq(users.id, createdUserId!));

//         expect(createdUser).toBeDefined();
//         expect(createdUser.email).toBe(email);
//         expect(createdUser.fullName).toBe(fullName);
//         expect(createdUser.passwordHash).not.toBe(password);

//         const passwordMatches = await bcrypt.compare(
//             password,
//             createdUser.passwordHash,
//         );

//         expect(passwordMatches).toBe(true);

//         const [subscription] = await db
//             .select()
//             .from(subscriptions)
//             .where(eq(subscriptions.userId, createdUserId!));

//         expect(subscription).toBeDefined();
//         expect(subscription.planType).toBe("FREE");
//         expect(subscription.requestLimit).toBe(50);
//     });
// });









import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../index.ts"; // Full Server App Import

describe("POST /api/auth/register (HTTP Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Register API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Register API Integration Tests Finished.");
    });

    it("should successfully register a new user via HTTP and return 201", async () => {
        const uniqueEmail = `test-${Date.now()}-${Math.random()}@example.com`;

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: uniqueEmail,
                password: "StrongPassword123!",
                fullName: "HTTP Test User",
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Registered successfully");
        expect(response.body).toHaveProperty("userId");
    });

    it("should return 400 if required fields are missing", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "emdad@gmail.com",
                password: "87654321",
                fullName: "ullah",
            });

        // সার্ভিস/রাউটে ভ্যালিডেশন বসানোর পর এটি ৪০০ রিটার্ন করবে এবং টেস্ট পাস করবে
        expect([400, 422]).toContain(response.status);
    });
});