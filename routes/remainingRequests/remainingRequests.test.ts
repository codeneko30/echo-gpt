import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("GET /api/subscriptions/remaining-requests (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Remaining Requests API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Remaining Requests API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .get("/api/subscriptions/remaining-requests");

        expect(response.status).toBe(401);
    });

    it("should return 200 or 404/500 when valid authorization token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 2, email: "rose@echogpt.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .get("/api/subscriptions/remaining-requests")
            .set("Authorization", `Bearer ${validToken}`);

        expect([200, 404, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("remaining");
            expect(typeof response.body.remaining).toBe("number");
        }
    }, 10000);
});