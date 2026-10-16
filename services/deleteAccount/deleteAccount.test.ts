import { beforeEach, describe, expect, it, vi } from "vitest";

// Drizzle DB Mocks Setup
const mocks = vi.hoisted(() => ({
    delete: vi.fn(),
    where: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        delete: mocks.delete,
    },
}));

import { deleteUserAccount } from "./deleteAccount.ts";

describe("deleteUserAccount Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.delete.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should successfully delete user account for a valid user ID", async () => {
        mocks.where.mockResolvedValueOnce(undefined);

        const result = await deleteUserAccount(1);

        expect(result).toEqual({ message: "Account deleted successfully" });
        expect(mocks.delete).toHaveBeenCalled();
    });

    it("should throw an error if user ID is missing", async () => {
        await expect(deleteUserAccount(0)).rejects.toThrow("User ID is required");
    });
});