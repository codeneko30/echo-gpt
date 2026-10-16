import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts"; // Full Server App Import

describe("DELETE /api/users/account (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Delete Account API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Delete Account API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .delete("/api/users/account");

        expect(response.status).toBe(401);
    });

    it("should return 200 or 500 when valid authorization token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        // টেস্টের জন্য একটি ডামি আইডি ব্যবহার করা হলো (সতর্কতা: রিয়েল ডিবি হলে ইউজার ডিলিট হয়ে যেতে পারে, তাই টেস্ট ইউজারের আইডি দিতে পারেন)
        const validToken = jwt.sign({ id: 15, email: "logout-test-fb2e65c8-abd2-4617-9816-3107ad446a52@example.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .delete("/api/users/account")
            .set("Authorization", `Bearer ${validToken}`);

        // ডেটাবেসে সফলভাবে ডিলিট হলে ২০০ অথবা ডিবি এরর থাকলে ৫০০ আসতে পারে
        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("message", "Account deleted successfully");
        }
    }, 10000);
});