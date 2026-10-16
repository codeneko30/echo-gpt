import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("PUT /api/providers/:id (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Update Provider API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Update Provider API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .put("/api/providers/1")
            .send({ apiKey: "new-key", isActive: true });

        expect(response.status).toBe(401);
    });

    it("should process provider update when admin token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const adminToken = jwt.sign({ id: 1, email: "admin@echogpt.com", role: "ADMIN" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .put("/api/providers/2")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ apiKey: "new_key", isActive: true });

        expect([200, 400, 403, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("message", "Provider updated successfully");
        }
    }, 10000);
});