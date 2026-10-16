import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

// Drizzle DB মক সেটআপ
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

import { refreshAccessToken } from "./refresh.ts";

describe("refreshAccessToken Service (Mock Unit Test)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({
            from: mocks.from,
        });
        mocks.from.mockReturnValue({
            where: mocks.where,
        });
    });

    it("should return a new access token for a valid refresh token", async () => {
        const mockUser = { id: 1, email: "test@example.com", roleId: 2 };
        const mockRole = { id: 2, name: "USER" };

        vi.spyOn(jwt, "verify").mockReturnValue({ id: 1 } as never);
        mocks.where.mockResolvedValueOnce([mockUser]); // User found
        mocks.where.mockResolvedValueOnce([mockRole]); // Role found
        vi.spyOn(jwt, "sign").mockReturnValue("new_mock_access_token" as never);

        const result = await refreshAccessToken("valid_refresh_token");

        expect(result).toHaveProperty("accessToken", "new_mock_access_token");
    });

    it("should throw an error if refresh token is missing", async () => {
        await expect(refreshAccessToken("")).rejects.toThrow("Refresh token required");
    });

    it("should throw an error if refresh token is invalid", async () => {
        vi.spyOn(jwt, "verify").mockImplementation(() => {
            throw new Error("Invalid token");
        });

        await expect(refreshAccessToken("invalid_token")).rejects.toThrow("Invalid refresh token");
    });
});