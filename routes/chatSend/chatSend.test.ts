import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts";

describe("POST /api/chat/send (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Chat Send API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Chat Send API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .post("/api/chat/send")
            .send({ prompt: "Hello devnet ltd" });

        expect(response.status).toBe(401);
    });

    it("should return 400 if prompt is missing", async () => {
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 22, email: "emdad@gmail.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .post("/api/chat/send")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ prompt: "" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Prompt is required");
    });
});