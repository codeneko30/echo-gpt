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

import { getAdminDashboardStats } from "./adminDashboard.ts";

describe("getAdminDashboardStats Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });
    });

    it("should return dashboard statistics correctly", async () => {
        mocks.from
            .mockResolvedValueOnce([{ count: 10 }]) // users count
            .mockResolvedValueOnce([{ count: 45 }]); // chats count

        const result = await getAdminDashboardStats();

        expect(result).toEqual({
            totalUsers: 10,
            totalChats: 45,
            status: "OK",
        });
        expect(mocks.select).toHaveBeenCalledTimes(2);
    });
});