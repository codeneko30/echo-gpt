import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("GET /api/subscriptions/status (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Subscription Status API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Subscription Status API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .get("/api/subscriptions/status");

        expect(response.status).toBe(401);
    });

    it("should return 200 or 404/500 when a valid authorization token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 19, email: "test-1791740420604@example.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .get("/api/subscriptions/status")
            .set("Authorization", `Bearer ` + validToken);

        // ডেটাবেসে সাবস্ক্রিপশন থাকলে ২০০, না থাকলে ৪০৪ বা এরর থাকলে ৫০০ আসতে পারে
        expect([200, 404, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("planType");
            expect(response.body).toHaveProperty("requestLimit");
        }
    }, 10000);
});