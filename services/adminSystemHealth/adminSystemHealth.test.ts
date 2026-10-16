import { describe, expect, it } from "vitest";
import { getSystemHealth } from "./adminSystemHealth.ts";

describe("getSystemHealth Service (Mock Unit Test)", () => {
    it("should return system health statistics successfully", () => {
        const result = getSystemHealth();

        expect(result).toHaveProperty("system", "Healthy");
        expect(result).toHaveProperty("uptime");
        expect(typeof result.uptime).toBe("number");
        expect(result).toHaveProperty("memory");
        expect(result.memory).toHaveProperty("rss");
    });
});