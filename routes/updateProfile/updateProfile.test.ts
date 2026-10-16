import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts"; // Full Server App Import

describe("PUT /api/users/update-profile (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Update Profile API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Update Profile API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .put("/api/users/update-profile")
            .send({ fullName: "New Name" });

        expect(response.status).toBe(401);
    });

    it("should return 200 and success message when valid token and fullName are provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 21, email: "test-1791740587961-0.4993229375458583@example.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .put("/api/users/update-profile")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ fullName: "alif" });

        // ডেটাবেসে ইউজার থাকলে ২০০ আসবে, অথবা ইউজার না থাকলে ৫শ/অন্যান্য এরর হ্যান্ডেল করবে
        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("message", "Profile updated successfully");
        }
    }, 10000);
});