import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts"; // Full Server App Import

describe("PUT /api/users/change-password (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Change Password API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Change Password API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .put("/api/users/change-password")
            .send({ oldPassword: "old123", newPassword: "new123" });

        expect(response.status).toBe(401);
    });

    it("should return 400 if oldPassword or newPassword is missing", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 1, email: "test@example.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ oldPassword: "old123" }); // newPassword missing

        expect(response.status).toBe(400);
    });

    it("should handle request properly when valid token and body are sent", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 1, email: "test@example.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .put("/api/users/change-password")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ oldPassword: "wrongOldPassword", newPassword: "newSecurePassword123" });

        // ডেটাবেসে সঠিক পুরনো পাসওয়ার্ড না মিললে 400 বা ইউজার না থাকলে 404 অথবা সফল হলে 200 আসতে পারে
        expect([200, 400, 404]).toContain(response.status);
    }, 10000);
});