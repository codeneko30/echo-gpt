import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    insert: vi.fn(),
    values: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        insert: mocks.insert,
    },
}));

import { performWebSearch } from "./search.ts";

describe("performWebSearch Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.insert.mockReturnValue({
            values: mocks.values,
        });
    });

    it("should successfully perform search and save to database", async () => {
        mocks.values.mockResolvedValueOnce(undefined);

        const result = await performWebSearch(21, "Bun.js runtime");

        expect(result).toHaveProperty("query", "Bun.js runtime");
        expect(result).toHaveProperty("results");
        expect(Array.isArray(result.results)).toBe(true);
        expect(mocks.insert).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if query is missing", async () => {
        await expect(performWebSearch(21, "")).rejects.toThrow("Search query is required");
    });

    it("should throw an error if user ID is missing", async () => {
        await expect(performWebSearch(0, "Test query")).rejects.toThrow("User ID is required");
    });
});