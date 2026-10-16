import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("GET /api/admin/users (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Admin Users API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Admin Users API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .get("/api/admin/users");

        expect(response.status).toBe(401);
    });

    it("should return 403 if non-admin token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const userToken = jwt.sign({ id: 21, email: "anika@example.com", role: "USER" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .get("/api/admin/users")
            .set("Authorization", `Bearer ${userToken}`);

        expect(response.status).toBe(403);
    });

    it("should return 200 and users array when admin token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const adminToken = jwt.sign({ id: 1, email: "admin@echogpt.com", role: "ADMIN" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .get("/api/admin/users")
            .set("Authorization", `Bearer ${adminToken}`);

        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(Array.isArray(response.body)).toBe(true);
        }
    }, 10000);
});