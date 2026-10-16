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

import { getUserSearchHistory } from "./searchHistory.ts";

describe("getUserSearchHistory Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });

        mocks.from.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should return search history list for a valid user ID", async () => {
        const mockSearchHistoryList = [
            { id: 1, userId: 21, query: "Bun runtime", results: [{ title: "Bun", snippet: "Fast JS runtime" }] },
            { id: 2, userId: 21, query: "Drizzle ORM", results: [{ title: "Drizzle", snippet: "TypeScript ORM" }] },
        ];

        mocks.where.mockResolvedValueOnce(mockSearchHistoryList);

        const result = await getUserSearchHistory(21);

        expect(result).toEqual(mockSearchHistoryList);
        expect(mocks.select).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if user ID is missing", async () => {
        await expect(getUserSearchHistory(0)).rejects.toThrow("User ID is required");
    });
});