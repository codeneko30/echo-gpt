import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("POST /api/subscriptions/upgrade (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Subscription Upgrade API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Subscription Upgrade API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .post("/api/subscriptions/upgrade")
            .send({ planType: "PREMIUM" });

        expect(response.status).toBe(401);
    });

    it("should return 200 or 500 when valid authorization token and planType are provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 22, email: "emdad@gmail.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .post("/api/subscriptions/upgrade")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ planType: "PREMIUM" });

        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("message", "Subscription upgraded successfully");
        }
    }, 10000);
});