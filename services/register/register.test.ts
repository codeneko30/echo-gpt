
import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

import { db } from "../../db/connection.ts";
import { registerUser } from "./register.ts";

// Mock database methods
const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        select: mocks.select,
        insert: mocks.insert,
    },
}));

describe("registerUser Service", () => {
    const userRole = {
        id: 2,
        name: "USER",
    };

    const newUser = {
        id: 10,
        email: "test@example.com",
        passwordHash: "hashed-password",
        fullName: "Test User",
        roleId: 2,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock role lookup chain
        mocks.select.mockReturnValue({
            from: mocks.from,
        });

        mocks.from.mockReturnValue({
            where: mocks.where,
        });

        mocks.where.mockResolvedValue([userRole]);

        // Mock user insertion chain
        mocks.insert.mockImplementation(() => ({
            values: mocks.values,
        }));

        mocks.values.mockImplementation((data) => {
            // User insertion
            if (data && "passwordHash" in data) {
                return {
                    returning: mocks.returning,
                };
            }

            // Subscription insertion
            return Promise.resolve(undefined);
        });

        mocks.returning.mockResolvedValue([newUser]);

        // Restore bcrypt hash implementation
        vi.spyOn(bcrypt, "hash").mockResolvedValue(
            "hashed-password" as never
        );
    });

    it("should find the USER role", async () => {
        await registerUser(
            "test@example.com",
            "password123",
            "Test User"
        );

        expect(mocks.select).toHaveBeenCalledTimes(1);
        expect(mocks.from).toHaveBeenCalledTimes(1);
        expect(mocks.where).toHaveBeenCalledTimes(1);
    });

    it("should hash the password before saving", async () => {
        await registerUser(
            "test@example.com",
            "password123",
            "Test User"
        );

        expect(bcrypt.hash).toHaveBeenCalledWith(
            "password123",
            10
        );
    });

    it("should return the created user", async () => {
        const result = await registerUser(
            "test@example.com",
            "password123",
            "Test User"
        );

        expect(result).toEqual(newUser);
    });

    it("should create a FREE subscription", async () => {
        await registerUser(
            "test@example.com",
            "password123",
            "Test User"
        );

        expect(mocks.insert).toHaveBeenCalledTimes(2);

        expect(mocks.values).toHaveBeenCalledWith({
            userId: newUser.id,
            planType: "FREE",
            requestLimit: 50,
        });
    });

    it("should throw an error when role lookup fails", async () => {
        mocks.where.mockRejectedValue(
            new Error("Database role lookup failed")
        );

        await expect(
            registerUser(
                "test@example.com",
                "password123",
                "Test User"
            )
        ).rejects.toThrow("Database role lookup failed");

        expect(mocks.insert).not.toHaveBeenCalled();
    });

    it("should throw an error when USER role is missing", async () => {
        mocks.where.mockResolvedValue([]);

        await expect(
            registerUser(
                "test@example.com",
                "password123",
                "Test User"
            )
        ).rejects.toThrow();

        // db.insert(users) is called before userRole.id is evaluated.
        expect(mocks.insert).toHaveBeenCalledTimes(1);

        // The error occurs before values() and returning() execute.
        expect(mocks.values).not.toHaveBeenCalled();
        expect(mocks.returning).not.toHaveBeenCalled();
    });

    it("should throw an error when user insertion fails", async () => {
        mocks.values.mockImplementationOnce(() => ({
            returning: () =>
                Promise.reject(
                    new Error("User insertion failed")
                ),
        }));

        await expect(
            registerUser(
                "test@example.com",
                "password123",
                "Test User"
            )
        ).rejects.toThrow("User insertion failed");
    });

    it("should throw an error when subscription insertion fails", async () => {
        mocks.values
            .mockImplementationOnce(() => ({
                returning: mocks.returning,
            }))
            .mockImplementationOnce(() =>
                Promise.reject(
                    new Error("Subscription insertion failed")
                )
            );

        await expect(
            registerUser(
                "test@example.com",
                "password123",
                "Test User"
            )
        ).rejects.toThrow("Subscription insertion failed");
    });
});
