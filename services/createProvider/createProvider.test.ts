import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        insert: mocks.insert,
    },
}));

import { createProvider } from "./createProvider.ts";

describe("createProvider Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.insert.mockReturnValue({
            values: mocks.values,
        });

        mocks.values.mockReturnValue({
            returning: mocks.returning,
        });
    });

    it("should successfully create a provider", async () => {
        const mockCreatedProvider = {
            id: 1,
            providerName: "OpenAI",
            apiKey: "sk-test-key-123",
            isDefault: true,
            isActive: true,
        };

        mocks.returning.mockResolvedValueOnce([mockCreatedProvider]);

        const result = await createProvider("OpenAI", "sk-test-key-123", true, true);

        expect(result).toEqual(mockCreatedProvider);
        expect(mocks.insert).toHaveBeenCalledTimes(1);
        expect(mocks.values).toHaveBeenCalledWith({
            providerName: "OpenAI",
            apiKey: "sk-test-key-123",
            isDefault: true,
            isActive: true,
        });
    });

    it("should throw an error if providerName is missing", async () => {
        await expect(createProvider("", "sk-test-key-123")).rejects.toThrow("Provider name is required");
    });

    it("should throw an error if apiKey is missing", async () => {
        await expect(createProvider("OpenAI", "")).rejects.toThrow("API key is required");
    });
});