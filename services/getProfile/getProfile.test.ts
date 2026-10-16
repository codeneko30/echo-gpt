
import { beforeEach, describe, expect, it, vi } from "vitest";

// Drizzle DB Mocks Setup
const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        select: mocks.select,
    },
}));

import { getUserProfile } from "./getProfile.ts";

describe("getUserProfile Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });
        mocks.from.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should return profile details for a valid user ID", async () => {
        const mockProfile = { id: 1, email: "user@example.com", fullName: "John Doe" };
        mocks.where.mockResolvedValueOnce([mockProfile]);

        const result = await getUserProfile(1);

        expect(result).toEqual(mockProfile);
        expect(mocks.select).toHaveBeenCalled();
    });

    it("should throw an error if user ID is missing", async () => {
        await expect(getUserProfile(0)).rejects.toThrow("User ID is required");
    });

    it("should throw an error if user is not found in database", async () => {
        mocks.where.mockResolvedValueOnce([]); // No user found

        await expect(getUserProfile(999)).rejects.toThrow("User not found");
    });
});