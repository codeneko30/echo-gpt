import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../index.ts";

describe("POST /api/auth/refresh (Full Server Real API Integration Test)", () => {
    
    beforeAll(async () => {
        // টেস্ট শুরু হওয়ার আগের প্রস্তুতি (যেমন: টেস্ট ডেটাবেস কানেকশন চেক করা)
        console.log("Starting Full Server Integration Tests...");
    });

    afterAll(async () => {
        // টেস্ট শেষ হওয়ার পর ক্লিনআপ বা ডিবি কানেকশন ক্লোজ করা
        console.log("Full Server Integration Tests Finished.");
    });

    it("should return 401 if refresh token is missing", async () => {
        const response = await request(app)
            .post("/api/auth/refresh")
            .send({});

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Refresh token required");
    });

    it("should return 403 if refresh token is invalid", async () => {
        const response = await request(app)
            .post("/api/auth/refresh")
            .send({ refreshToken: "fake_refresh_token_12345" });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("error", "Invalid refresh token");
    });
});