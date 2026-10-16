
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from "vitest";
import { eq } from "drizzle-orm";

import loginRouter from "./login.ts";
import { db } from "../../db/connection.ts";
import { users, roles, sessions } from "../../db/schema.ts";

const app = express();

app.use(express.json());
app.use(loginRouter);

describe("POST /api/auth/login - Real Integration Test", () => {
    const email = `vitest-login-${crypto.randomUUID()}@example.com`;
    const password = "TestPassword123!";
    const fullName = "Vitest Login User";

    let userId: number | undefined;

    beforeAll(async () => {
        const [userRole] = await db
            .select()
            .from(roles)
            .where(eq(roles.name, "USER"));

        if (!userRole) {
            throw new Error(
                'USER role not found. Seed the test database first.'
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [createdUser] = await db
            .insert(users)
            .values({
                email,
                passwordHash,
                fullName,
                roleId: userRole.id,
            })
            .returning();

        userId = createdUser.id;
    }, 15000);

    afterAll(async () => {
        if (userId !== undefined) {
            await db
                .delete(sessions)
                .where(eq(sessions.userId, userId));

            await db
                .delete(users)
                .where(eq(users.id, userId));
        }
    }, 15000);

    it("should login successfully and create a session", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password,
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();

        const accessSecret =
            process.env.JWT_ACCESS_SECRET || "access_secret";

        const refreshSecret =
            process.env.JWT_REFRESH_SECRET || "refresh_secret";

        const accessPayload = jwt.verify(
            response.body.accessToken,
            accessSecret
        ) as jwt.JwtPayload;

        const refreshPayload = jwt.verify(
            response.body.refreshToken,
            refreshSecret
        ) as jwt.JwtPayload;

        expect(accessPayload.id).toBe(userId);
        expect(accessPayload.email).toBe(email);
        expect(accessPayload.role).toBe("USER");
        expect(refreshPayload.id).toBe(userId);

        const userSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.userId, userId!));

        expect(userSessions.length).toBeGreaterThan(0);

        const matchingSession = userSessions.find(
            (session) =>
                session.refreshTokenHash !==
                response.body.refreshToken
        );

        expect(matchingSession).toBeDefined();

        const refreshTokenMatches = await bcrypt.compare(
            response.body.refreshToken,
            matchingSession!.refreshTokenHash
        );

        expect(refreshTokenMatches).toBe(true);
        expect(matchingSession!.expiresAt.getTime()).toBeGreaterThan(
            Date.now()
        );
    });

    it("should return 401 when the password is incorrect", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "WrongPassword123!",
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Invalid credentials");
    });

    it("should return 401 when the user does not exist", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: `missing-${crypto.randomUUID()}@example.com`,
                password: "TestPassword123!",
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Invalid credentials");
    });
});
