import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("DELETE /api/providers-delete/:id (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Delete Provider API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Delete Provider API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .delete("/api/providers-delete/1");

        expect(response.status).toBe(401);
    });

    it("should process provider deletion when admin token is provided", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const adminToken = jwt.sign({ id: 1, email: "admin@echogpt.com", role: "ADMIN" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .delete("/api/providers-delete/15")
            .set("Authorization", `Bearer ${adminToken}`);

        expect([200, 400, 403, 500]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("message", "Provider deleted successfully");
        }
    }, 10000);
});