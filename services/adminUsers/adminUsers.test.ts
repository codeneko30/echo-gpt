import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    from: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        select: mocks.select,
    },
}));

import { getAllUsersForAdmin } from "./adminUsers.ts";

describe("getAllUsersForAdmin Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });
    });

    it("should return a list of all users successfully", async () => {
        const mockUsersList = [
            { id: 1, email: "anika@example.com", role: "ADMIN" },
            { id: 2, email: "tasnim@example.com", role: "USER" },
        ];

        mocks.from.mockResolvedValueOnce(mockUsersList);

        const result = await getAllUsersForAdmin();

        expect(result).toEqual(mockUsersList);
        expect(mocks.select).toHaveBeenCalledTimes(1);
        expect(mocks.from).toHaveBeenCalledTimes(1);
    });

    it("should return empty array if no users found", async () => {
        mocks.from.mockResolvedValueOnce([]);

        const result = await getAllUsersForAdmin();

        expect(result).toEqual([]);
    });
});