import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    from: vi.fn(),
    limit: vi.fn(),
}));

vi.mock("../../db/connection.ts", () => ({
    db: {
        select: mocks.select,
    },
}));

import { getAdminApiLogs } from "./adminLogs.ts";

describe("getAdminApiLogs Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });

        mocks.from.mockReturnValue({
            limit: mocks.limit,
        });
    });

    it("should return a list of API usage logs successfully", async () => {
        const mockLogsList = [
            { id: 1, userId: 21, endpoint: "/api/chat/send", method: "POST", statusCode: 200 },
            { id: 2, userId: 22, endpoint: "/api/search", method: "POST", statusCode: 200 },
        ];

        mocks.limit.mockResolvedValueOnce(mockLogsList);

        const result = await getAdminApiLogs();

        expect(result).toEqual(mockLogsList);
        expect(mocks.select).toHaveBeenCalledTimes(1);
        expect(mocks.limit).toHaveBeenCalledWith(50);
    });

    it("should return empty array if no logs found", async () => {
        mocks.limit.mockResolvedValueOnce([]);

        const result = await getAdminApiLogs();

        expect(result).toEqual([]);
    });
});