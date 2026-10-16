import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../index.ts";

describe("GET /api/providers/health (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Provider Health API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Provider Health API Integration Tests Finished.");
    });

    it("should return 200 and healthy status without requiring authentication", async () => {
        const response = await request(app)
            .get("/api/providers/health");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status", "AI Providers Service is Healthy");
    }, 10000);
});