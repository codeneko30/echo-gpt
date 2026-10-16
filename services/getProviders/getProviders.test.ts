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

import { getAllProviders } from "./getProviders.ts";

describe("getAllProviders Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });
    });

    it("should return a list of AI providers", async () => {
        const mockProvidersList = [
            { id: 1, name: "OpenAI", isEnabled: true },
            { id: 2, name: "Anthropic", isEnabled: true },
        ];

        mocks.from.mockResolvedValueOnce(mockProvidersList);

        const result = await getAllProviders();

        expect(result).toEqual(mockProvidersList);
        expect(mocks.select).toHaveBeenCalledTimes(1);
        expect(mocks.from).toHaveBeenCalledTimes(1);
    });

    it("should return empty array if no providers found", async () => {
        mocks.from.mockResolvedValueOnce([]);

        const result = await getAllProviders();

        expect(result).toEqual([]);
    });
});