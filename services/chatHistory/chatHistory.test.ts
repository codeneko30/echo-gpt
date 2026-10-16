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

import { getUserChatHistory } from "./chatHistory.ts";

describe("getUserChatHistory Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });

        mocks.from.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should return chat history list for a valid user ID", async () => {
        const mockHistoryList = [
            { id: 1, userId: 21, prompt: "Hello", response: "Hi there!" },
            { id: 2, userId: 21, prompt: "How are you?", response: "I am fine, thanks!" },
        ];

        mocks.where.mockResolvedValueOnce(mockHistoryList);

        const result = await getUserChatHistory(21);

        expect(result).toEqual(mockHistoryList);
        expect(mocks.select).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if user ID is missing", async () => {
        await expect(getUserChatHistory(0)).rejects.toThrow("User ID is required");
    });
});