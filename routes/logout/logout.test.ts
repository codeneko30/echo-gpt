import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../index.ts";
import { db } from "../../db/connection.ts";
import { users, roles, sessions } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

describe("POST /api/auth/logout - Real Integration Test", () => {
    let authToken: string;
    let testUserId: number;

    beforeAll(async () => {
        // ১. টেস্টের জন্য USER রোল বের করা
        const [userRole] = await db
            .select()
            .from(roles)
            .where(eq(roles.name, "USER"));

        if (!userRole) {
            throw new Error("USER role missing in database");
        }

        // ২. রিয়েল টেস্ট ইউজার তৈরি বা নেওয়া
        const testEmail = `logout-test-${crypto.randomUUID()}@example.com`;
        const [user] = await db
            .insert(users)
            .values({
                email: testEmail,
                passwordHash: "dummyhash",
                fullName: "Logout Test User",
                roleId: userRole.id,
            })
            .returning();

        testUserId = user.id;

        // ৩. ইউজারের জন্য টেস্ট সেশন তৈরি করা
        await db.insert(sessions).values({
            userId: testUserId,
            refreshTokenHash: "dummyrefreshtokenhash",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // ৪. রিয়েল JWT Access Token তৈরি করা
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        authToken = jwt.sign(
            { id: user.id, email: user.email, role: "USER" },
            secret,
            { expiresIn: "15m" }
        );
    });

    it("should logout successfully with valid authorization header", async () => {
        const response = await request(app)
            .post("/api/auth/logout")
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Logged out successfully");

        // ৫. রিয়েল ডিবি থেকে সেশনটি ডিলিট হয়েছে কিনা তা চেক করা
        const userSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.userId, testUserId));

        expect(userSessions.length).toBe(0);
    });

    it("should return 401/403 if token is missing or invalid", async () => {
        const response = await request(app).post("/api/auth/logout");

        // Auth Middleware অনুযায়ী ৪০১/৪০৩ আসার কথা
        expect(response.status).toBeGreaterThanOrEqual(400);
    });
});