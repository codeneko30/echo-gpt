

import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Drizzle DB মক সেটআপ
const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        select: mocks.select,
        insert: mocks.insert,
    },
}));

import { loginUser } from "./login.ts";

describe("loginUser Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Drizzle Method Chaining (select -> from -> where) মক করা
        mocks.select.mockReturnValue({
            from: mocks.from,
        });
        mocks.from.mockReturnValue({
            where: mocks.where,
        });

        // Insert Method Chaining (insert -> values) মক করা
        mocks.insert.mockReturnValue({
            values: mocks.values,
        });
    });

    it("should login successfully with valid credentials and return tokens", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            passwordHash: "hashed_password123",
            roleId: 2,
        };

        const mockRole = {
            id: 2,
            name: "USER",
        };

        mocks.where.mockResolvedValueOnce([mockUser]); // User found
        mocks.where.mockResolvedValueOnce([mockRole]); // Role found

        vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(true as never);
        vi.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashed_refresh_token" as never);
        vi.spyOn(jwt, "sign").mockReturnValue("mock_jwt_token" as never);

        mocks.values.mockResolvedValueOnce(undefined);

        const result = await loginUser("test@example.com", "password123");

        expect(result).toHaveProperty("accessToken", "mock_jwt_token");
        expect(result).toHaveProperty("refreshToken", "mock_jwt_token");
        expect(mocks.insert).toHaveBeenCalled();
    });

    it("should throw an error when user is not found", async () => {
        mocks.where.mockResolvedValueOnce([]); // No user found

        await expect(
            loginUser("wrong@example.com", "password123")
        ).rejects.toThrow("Invalid credentials");
    });

    it("should throw an error when password does not match", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            passwordHash: "hashed_password123",
            roleId: 2,
        };

        mocks.where.mockResolvedValueOnce([mockUser]);
        vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(false as never); // Password mismatch

        await expect(
            loginUser("test@example.com", "wrongpassword")
        ).rejects.toThrow("Invalid credentials");
    });

    it("should throw an error when user role is missing", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            passwordHash: "hashed_password123",
            roleId: 99,
        };

        mocks.where.mockResolvedValueOnce([mockUser]); // User found
        vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(true as never);
        mocks.where.mockResolvedValueOnce([]); // Role not found (returns empty array)

        await expect(
            loginUser("test@example.com", "password123")
        ).rejects.toThrow("User role not found");
    });
});