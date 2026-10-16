import { beforeEach, describe, expect, it, vi } from "vitest";

// Drizzle-এর মক ফাংশন তৈরি
const mocks = vi.hoisted(() => ({
    delete: vi.fn(),
    where: vi.fn(),
}));

// DB Connection মক করা
vi.mock("../../db/connection.ts", () => ({
    db: {
        delete: mocks.delete,
    },
}));

import { logoutUser } from "./logout.ts";

describe("logoutUser Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Method chaining সাপোর্ট দেওয়ার জন্য মক সেটআপ
        mocks.delete.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should call delete on sessions table with correct userId", async () => {
        mocks.where.mockResolvedValueOnce(undefined);

        const testUserId = 42;
        await logoutUser(testUserId);

        expect(mocks.delete).toHaveBeenCalled();
        expect(mocks.where).toHaveBeenCalledTimes(1);
    });

    it("should propagate database errors if deletion fails", async () => {
        mocks.where.mockRejectedValueOnce(new Error("Database connection lost"));

        await expect(logoutUser(123)).rejects.toThrow("Database connection lost");
    });
});