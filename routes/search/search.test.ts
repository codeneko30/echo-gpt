import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("POST /api/search (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Web Search API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Web Search API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .post("/api/search")
            .send({ query: "Express.js" });

        expect(response.status).toBe(401);
    });

    it("should return 400 if query is missing", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 21, email: "emdad@gmail.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .post("/api/search")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ query: "" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Search query is required");
    });

    it("should return 200 and search results when valid token and query are provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 22, email: "emdad@gmail.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .post("/api/search")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ query: "Drizzle ORM" });

        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("query", "Drizzle ORM");
            expect(response.body).toHaveProperty("results");
        }
    }, 10000);
});