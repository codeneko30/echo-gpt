import { beforeEach, describe, expect, it, vi } from "vitest";

// Drizzle DB এবং Bcrypt Mocks Setup
const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    compare: vi.fn(),
    hash: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        select: mocks.select,
        update: mocks.update,
    },
}));

vi.mock("bcrypt", () => ({
    default: {
        compare: mocks.compare,
        hash: mocks.hash,
    },
}));

import { changeUserPassword } from "./changePassword.ts";

describe("changeUserPassword Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });
        mocks.from.mockReturnValue({
            where: mocks.where,
        });

        mocks.update.mockReturnValue({
            set: mocks.set,
        });
        mocks.set.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should successfully change password when old password is correct", async () => {
        const mockUser = { id: 1, passwordHash: "hashed_old_password" };
        mocks.where.mockResolvedValueOnce([mockUser]);
        mocks.compare.mockResolvedValueOnce(true);
        mocks.hash.mockResolvedValueOnce("hashed_new_password");
        mocks.where.mockResolvedValueOnce(undefined);

        const result = await changeUserPassword(1, "oldPass123", "newPass123");

        expect(result).toEqual({ message: "Password changed successfully" });
        expect(mocks.compare).toHaveBeenCalledWith("oldPass123", "hashed_old_password");
        expect(mocks.hash).toHaveBeenCalledWith("newPass123", 10);
    });

    it("should throw an error if old password is incorrect", async () => {
        const mockUser = { id: 1, passwordHash: "hashed_old_password" };
        mocks.where.mockResolvedValueOnce([mockUser]);
        mocks.compare.mockResolvedValueOnce(false); // Incorrect password

        await expect(changeUserPassword(1, "wrongPass", "newPass123"))
            .rejects.toThrow("Incorrect old password");
    });

    it("should throw an error if user is not found", async () => {
        mocks.where.mockResolvedValueOnce([]); // No user found

        await expect(changeUserPassword(999, "oldPass123", "newPass123"))
            .rejects.toThrow("User not found");
    });
});