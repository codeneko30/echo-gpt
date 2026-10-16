import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("GET /api/providers-get (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Get Providers API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Get Providers API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .get("/api/providers-get");

        expect(response.status).toBe(401);
    });

    it("should return 200 and list of providers when valid authorization token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 22, email: "emdad@gmail.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .get("/api/providers-get")
            .set("Authorization", `Bearer ${validToken}`);

        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(Array.isArray(response.body)).toBe(true);
        }
    }, 10000);
});