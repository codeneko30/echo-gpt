import { beforeEach, describe, expect, it, vi } from "vitest";

// Drizzle DB Mocks Setup
const mocks = vi.hoisted(() => ({
    update: vi.fn(),
    set: vi.fn(),
    where: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        update: mocks.update,
    },
}));

import { updateUserProfile } from "./updateProfile.ts";

describe("updateUserProfile Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.update.mockReturnValue({
            set: mocks.set,
        });
        mocks.set.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should successfully update profile for valid user and data", async () => {
        mocks.where.mockResolvedValueOnce(undefined);

        const result = await updateUserProfile(1, "Jane Doe");

        expect(result).toEqual({ message: "Profile updated successfully" });
        expect(mocks.update).toHaveBeenCalled();
    });

    it("should throw an error if user ID is missing", async () => {
        await expect(updateUserProfile(0, "Jane Doe")).rejects.toThrow("User ID is required");
    });

    it("should throw an error if fullName is empty", async () => {
        await expect(updateUserProfile(1, "")).rejects.toThrow("Full name is required");
    });
});