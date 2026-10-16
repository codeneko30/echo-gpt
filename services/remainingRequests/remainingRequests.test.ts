import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { getRemainingRequests } from "./remainingRequests.ts";

describe("getRemainingRequests Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });

        mocks.from.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should calculate and return remaining requests correctly", async () => {
        const mockSubscription = {
            id: 1,
            userId: 21,
            requestLimit: 50,
            requestsUsed: 15,
        };

        mocks.where.mockResolvedValueOnce([mockSubscription]);

        const result = await getRemainingRequests(21);

        expect(result).toEqual({ remaining: 35 });
        expect(mocks.select).toHaveBeenCalled();
    });

    it("should throw an error if subscription is not found", async () => {
        mocks.where.mockResolvedValueOnce([]);

        await expect(getRemainingRequests(99)).rejects.toThrow("Subscription not found");
    });

    it("should throw an error if user ID is missing", async () => {
        await expect(getRemainingRequests(0)).rejects.toThrow("User ID is required");
    });
});