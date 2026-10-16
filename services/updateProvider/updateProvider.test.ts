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

import { updateProvider } from "./updateProvider.ts";

describe("updateProvider Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.update.mockReturnValue({
            set: mocks.set,
        });

        mocks.set.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should successfully update provider details", async () => {
        mocks.where.mockResolvedValueOnce(undefined);

        const result = await updateProvider(1, "new-sk-key", true);

        expect(result).toEqual({ message: "Provider updated successfully" });
        expect(mocks.update).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if provider ID is missing", async () => {
        await expect(updateProvider(0, "key", true)).rejects.toThrow("Provider ID is required");
    });
});