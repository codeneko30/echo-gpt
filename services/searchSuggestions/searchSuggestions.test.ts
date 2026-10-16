import { describe, expect, it } from "vitest";
import { getSearchSuggestions } from "./searchSuggestions.ts";

describe("getSearchSuggestions Service (Mock Unit Test)", () => {
    it("should return static search suggestions successfully", () => {
        const result = getSearchSuggestions();
        
        expect(result).toHaveProperty("suggestions");
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBe(3);
        expect(result.suggestions).toContain("EchoGPT extension features");
    });
});