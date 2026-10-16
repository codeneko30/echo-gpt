import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("GET /api/search/suggestions (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Search Suggestions API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Search Suggestions API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .get("/api/search/suggestions");

        expect(response.status).toBe(401);
    });

    it("should return 200 and suggestions when a valid authorization token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 22, email: "emdad@gmail.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .get("/api/search/suggestions")
            .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("suggestions");
        expect(Array.isArray(response.body.suggestions)).toBe(true);
    }, 10000);
});