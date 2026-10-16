

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

export type AIProviderName =
    | "OPENAI"
    | "GEMINI"
    | "CLAUDE"
    | "KIMI"
    | "OPENROUTER";

export async function generateAIResponse(
    providerName: AIProviderName,
    prompt: string
): Promise<{ response: string; model: string }> {
    if (providerName === "OPENAI") {
        const apiKey = process.env.OPENAI_API_KEY?.trim();
        const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
        if (!apiKey) throw new Error("OPENAI_KEY_NOT_CONFIGURED");

        const client = new OpenAI({ apiKey });
        const result = await client.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }]
        });

        return {
            response: result.choices[0]?.message?.content ?? "",
            model: result.model
        };
    }

    if (providerName === "GEMINI") {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        if (!apiKey) throw new Error("GEMINI_KEY_NOT_CONFIGURED");

        const client = new GoogleGenAI({ apiKey });
        const result = await client.models.generateContent({
            model,
            contents: prompt
        });

        return { response: result.text ?? "", model };
    }

    if (providerName === "CLAUDE") {
        const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
        const model = process.env.CLAUDE_MODEL?.trim();
        if (!apiKey) throw new Error("CLAUDE_KEY_NOT_CONFIGURED");
        if (!model) throw new Error("CLAUDE_MODEL_NOT_CONFIGURED");

        const client = new Anthropic({ apiKey });
        const result = await client.messages.create({
            model,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }]
        });

        return {
            response: result.content
                .filter((item) => item.type === "text")
                .map((item) => item.text)
                .join("\n"),
            model: result.model
        };
    }

    if (providerName === "KIMI") {
        const apiKey = process.env.KIMI_API_KEY?.trim();
        const model = process.env.KIMI_MODEL?.trim();
        if (!apiKey) throw new Error("KIMI_KEY_NOT_CONFIGURED");
        if (!model) throw new Error("KIMI_MODEL_NOT_CONFIGURED");

        const client = new OpenAI({
            apiKey,
            baseURL: "https://api.moonshot.ai/v1"
        });

        const result = await client.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }]
        });

        return {
            response: result.choices[0]?.message?.content ?? "",
            model: result.model
        };
    }

    if (providerName === "OPENROUTER") {
        const apiKey = process.env.OPENROUTER_API_KEY?.trim();
        const model = process.env.OPENROUTER_MODEL || "openrouter/free";
        if (!apiKey) throw new Error("OPENROUTER_KEY_NOT_CONFIGURED");

        const client = new OpenAI({
            apiKey,
            baseURL: "https://openrouter.ai/api/v1"
        });

        const result = await client.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }]
        });

        return {
            response: result.choices[0]?.message?.content ?? "",
            model: result.model
        };
    }

    throw new Error("UNSUPPORTED_PROVIDER");
}
