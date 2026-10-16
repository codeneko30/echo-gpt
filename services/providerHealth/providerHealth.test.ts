import { describe, expect, it } from "vitest";
import { checkProviderHealth } from "./providerHealth.ts";

describe("checkProviderHealth Service (Mock Unit Test)", () => {
    it("should return healthy status message successfully", () => {
        const result = checkProviderHealth();
        expect(result).toEqual({ status: "AI Providers Service is Healthy" });
    });
});