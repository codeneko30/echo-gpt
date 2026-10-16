
// import { db } from "../db/connection.ts";
// import { aiProviders } from "../db/schema.ts";

// const openaiApiKey = process.env.OPENAI_API_KEY;
// const claudeApiKey = process.env.CLAUDE_API_KEY;
// const geminiApiKey = process.env.GEMINI_API_KEY;

// if (!openaiApiKey || !claudeApiKey || !geminiApiKey) {
//     throw new Error("AI provider API keys are not configured");
// }

// async function seedAiProviders() {

//     const data = [
//         { providerName: "OPENAI", apiKey: openaiApiKey, isDefault: true, isActive: true },
//         { providerName: "CLAUDE", apiKey: claudeApiKey, isDefault: false, isActive: true },
//         { providerName: "GEMINI", apiKey: geminiApiKey, isDefault: false, isActive: true },
//     ];

//     await db.insert(aiProviders).values(data).onConflictDoNothing();

//     console.log("AI Providers seeded successfully.");
// }

// seedAiProviders();



import { db } from "../db/connection.ts";
import { aiProviders } from "../db/schema.ts";

const openaiApiKey = process.env.OPENAI_API_KEY;
const claudeApiKey = process.env.CLAUDE_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!openaiApiKey || !claudeApiKey || !geminiApiKey) {
    throw new Error("AI provider API keys are not configured");
}

async function seedAiProviders() {
    const data = [
        { providerName: "OPENAI", apiKey: openaiApiKey, isDefault: true, isActive: true },
        { providerName: "CLAUDE", apiKey: claudeApiKey, isDefault: false, isActive: true },
        { providerName: "GEMINI", apiKey: geminiApiKey, isDefault: false, isActive: true },
    ];

    for (const provider of data) {
        await db
            .insert(aiProviders)
            .values(provider)
            .onConflictDoUpdate({
                target: aiProviders.providerName,
                set: {
                    apiKey: provider.apiKey,
                    isActive: true,
                    isDefault: provider.isDefault,
                    updatedAt: new Date(),
                },
            });
    }

    console.log("AI providers seeded and activated successfully.");
}

seedAiProviders()
    .catch((error) => {
        console.error("Failed to seed AI providers:", error);
        process.exitCode = 1;
    });
