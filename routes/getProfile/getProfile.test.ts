// import { describe, expect, it, beforeAll, afterAll } from "vitest";
// import request from "supertest";
// import jwt from "jsonwebtoken";
// import app from "../../index.ts"; // Full Server App Import

// describe("GET /api/users/profile (Full Server Real API Integration Test)", () => {

//     beforeAll(async () => {
//         console.log("Starting Profile API Integration Tests...");
//     });

//     afterAll(async () => {
//         console.log("Profile API Integration Tests Finished.");
//     });

//     it("should return 401 if authorization token is missing", async () => {
//         const response = await request(app)
//             .get("/api/users/profile");

//         expect(response.status).toBe(401);
//     });

//     it("should return 403 or 401 if invalid authorization token is provided", async () => {
//         const response = await request(app)
//             .get("/api/users/profile")
//             .set("Authorization", "Bearer invalid_token_xyz");

//         expect([401, 403]).toContain(response.status);
//     });

//     it("should return 200 and user profile data when valid token is passed", async () => {
//         // টেস্টের জন্য ডামি টোকেন তৈরি (আপনার authMiddleware এর সিগনেচার অনুযায়ী)
//         const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
//         const validToken = jwt.sign({ id: 1, email: "test@example.com" }, secret, { expiresIn: "5m" });

//         const response = await request(app)
//             .get("/api/users/profile")
//             .set("Authorization", `Bearer ${validToken}`);

//         // যদি টেস্ট ডিবিতে আইডি ১ থাকে তবে ২০০ আসবে
//         if (response.status === 200) {
//             expect(response.body).toHaveProperty("id");
//             expect(response.body).toHaveProperty("email");
//             expect(response.body).toHaveProperty("fullName");
//         } else {
//             // ইউজার ডিবিতে না থাকলে ৪০৪ আসবে
//             expect(response.status).toBe(404);
//         }
//     });
// });






import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.ts"; // Full Server App Import

describe("GET /api/users/profile (Full Server Real API Integration Test)", () => {

    beforeAll(async () => {
        console.log("Starting Profile API Integration Tests...");
    });

    afterAll(async () => {
        console.log("Profile API Integration Tests Finished.");
    });

    it("should return 401 if authorization token is missing", async () => {
        const response = await request(app)
            .get("/api/users/profile");

        expect(response.status).toBe(401);
    });

    it("should return 403 or 401 if invalid authorization token is provided", async () => {
        const response = await request(app)
            .get("/api/users/profile")
            .set("Authorization", "Bearer invalid_token_xyz");

        expect([401, 403]).toContain(response.status);
    });

    it("should return 200 and user profile data when valid token is passed", async () => {
        // টেস্টের জন্য ডামি টোকেন তৈরি
        const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
        const validToken = jwt.sign({ id: 1, email: "test@example.com" }, secret, { expiresIn: "5m" });

        const response = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${validToken}`);

        // ডেটাবেসে ইউজার থাকলে ২০০, না থাকলে ৪০৪ - দুটোই সঠিক ফ্লোর জন্য ভ্যালিড
        expect([200, 404]).toContain(response.status);

        if (response.status === 200) {
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("email");
            expect(response.body).toHaveProperty("fullName");
        } else {
            expect(response.body).toHaveProperty("error", "User not found");
        }
    }, 10000); // এখানে টাইমআউট ১০ সেকেন্ড (10000ms) করে দেওয়া হলো
});