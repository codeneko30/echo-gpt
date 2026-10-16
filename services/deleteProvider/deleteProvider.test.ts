import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    delete: vi.fn(),
    where: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        delete: mocks.delete,
    },
}));

import { deleteProvider } from "./deleteProvider.ts";

describe("deleteProvider Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.delete.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should successfully delete a provider", async () => {
        mocks.where.mockResolvedValueOnce(undefined);

        const result = await deleteProvider(1);

        expect(result).toEqual({ message: "Provider deleted successfully" });
        expect(mocks.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if provider ID is missing", async () => {
        await expect(deleteProvider(0)).rejects.toThrow("Provider ID is required");
    });
});