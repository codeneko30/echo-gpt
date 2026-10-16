import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    execute: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        select: mocks.select,
        execute: mocks.execute,
        insert: mocks.insert,
    },
}));

import { sendChatMessage } from "./chatSend.ts";

describe("sendChatMessage Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });
        mocks.from.mockReturnValue({
            where: mocks.where,
        });

        mocks.insert.mockReturnValue({
            values: mocks.values,
        });
    });

    it("should throw an error if prompt is empty", async () => {
        await expect(sendChatMessage(1, "")).rejects.toThrow("Prompt is required");
    });

    it("should throw an error if provider is unsupported", async () => {
        await expect(sendChatMessage(1, "Hello", "INVALID_PROVIDER" as any)).rejects.toThrow("UNSUPPORTED_PROVIDER");
    });

    it("should throw an error if provider is not found or inactive", async () => {
        mocks.where.mockResolvedValueOnce([]);

        await expect(sendChatMessage(1, "Hello", "OPENAI")).rejects.toThrow("OPENAI provider not found or inactive");
    });
});