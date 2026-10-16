import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { aiProviders, chatHistory } from "../../db/schema.ts";

export type AIProviderName = "OPENAI" | "GEMINI" | "CLAUDE" | "KIMI" | "OPENROUTER";

// এক্সটার্নাল এআই কল বা জেনারেট ফাংশন (প্রয়োজন অনুযায়ী আপনার ইমপ্লিমেন্টেশন থাকতে পারে)
export async function generateAIResponse(providerName: AIProviderName, prompt: string) {
    // ডামি রেসপন্স বা রিয়েল এআই প্রোভাইডার কল এখানে থাকবে
    return {
        response: `Mocked AI response for: ${prompt}`,
        model: `${providerName.toLowerCase()}-default-model`,
    };
}

export async function sendChatMessage(userId: number, prompt: string, providerName: AIProviderName = "OPENAI") {
    const allowedProviders: AIProviderName[] = ["OPENAI", "GEMINI", "CLAUDE", "KIMI", "OPENROUTER"];

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        throw new Error("Prompt is required");
    }
    if (!allowedProviders.includes(providerName)) {
        throw new Error("UNSUPPORTED_PROVIDER");
    }

    const [provider] = await db
        .select()
        .from(aiProviders)
        .where(and(eq(aiProviders.providerName, providerName), eq(aiProviders.isActive, true)));

    if (!provider) {
        throw new Error(`${providerName} provider not found or inactive`);
    }

    // সাবস্ক্রিপশন লিমিট চেক এবং আপডেট
    const usageResult = await db.execute(
        sql`UPDATE subscriptions SET requests_used = requests_used + 1 WHERE user_id = ${userId} AND requests_used < request_limit RETURNING user_id`
    );
    const usageRows = Array.isArray(usageResult) ? usageResult : usageResult.rows ?? [];
    
    if (usageRows.length === 0) {
        throw new Error("Subscription not found or request limit exceeded");
    }

    let usageReserved = true;

    try {
        const result = await generateAIResponse(providerName, prompt.trim());

        await db.insert(chatHistory).values({
            userId,
            providerId: provider.id,
            prompt: prompt.trim(),
            response: result.response,
        });

        return {
            prompt: prompt.trim(),
            response: result.response,
            provider: providerName,
            model: result.model,
        };
    } catch (error) {
        if (usageReserved) {
            try {
                await db.execute(sql`UPDATE subscriptions SET requests_used = GREATEST(requests_used - 1, 0) WHERE user_id = ${userId}`);
            } catch (rollbackError) {
                console.error("[CHAT] Usage rollback failed:", rollbackError);
            }
        }
        throw error;
    }
}