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

import { getUserSubscriptionStatus } from "./subscriptionStatus.ts";

describe("getUserSubscriptionStatus Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });

        mocks.from.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should return subscription details for a valid user ID", async () => {
        const mockSubscription = {
            id: 1,
            userId: 21,
            planType: "FREE",
            requestLimit: 50,
        };

        mocks.where.mockResolvedValueOnce([mockSubscription]);

        const result = await getUserSubscriptionStatus(21);

        expect(result).toEqual(mockSubscription);
        expect(mocks.select).toHaveBeenCalled();
    });

    it("should throw an error if subscription is not found", async () => {
        mocks.where.mockResolvedValueOnce([]);

        await expect(getUserSubscriptionStatus(99)).rejects.toThrow("Subscription not found");
    });
});