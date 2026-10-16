import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { upgradeUserSubscription } from "./subscriptionUpgrade.ts";

describe("upgradeUserSubscription Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.update.mockReturnValue({
            set: mocks.set,
        });

        mocks.set.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should successfully upgrade subscription for a valid user", async () => {
        mocks.where.mockResolvedValueOnce(undefined);

        const result = await upgradeUserSubscription(21, "PREMIUM");

        expect(result).toEqual({ message: "Subscription upgraded successfully" });
        expect(mocks.update).toHaveBeenCalled();
    });

    it("should throw an error if plan type is missing", async () => {
        await expect(upgradeUserSubscription(21, "")).rejects.toThrow("Plan type is required");
    });
});