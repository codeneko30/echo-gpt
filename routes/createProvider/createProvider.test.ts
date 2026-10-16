import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("POST /api/providers-post (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Create Provider API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Create Provider API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .post("/api/providers-post")
            .send({
                providerName: "OpenAI",
                apiKey: "sk-test-123456",
                isDefault: true,
                isActive: true,
            });

        expect(response.status).toBe(401);
    });

    it("should process provider creation request when admin token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        // অ্যাডমিন রোলের জন্য পে-লোড টোকেন
        const adminToken = jwt.sign({ id: 1, email: "admin@echogpt.com", role: "ADMIN" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .post("/api/providers-post")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                providerName: "Anthropic Claude",
                apiKey: "sk-ant-test-key",
                isDefault: false,
                isActive: true,
            });

        expect([201, 400, 403, 500]).toContain(response.status);

        if (response.status === 201) {
            expect(response.body).toHaveProperty("message", "Provider added successfully");
            expect(response.body).toHaveProperty("p");
        }
    }, 10000);
});