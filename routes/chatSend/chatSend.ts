import { Router } from "express";

import { sendChatMessage } from "../../services/chatSend/chatSend.ts";
import type { AIProviderName } from "../../services/chatSend/chatSend.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.post("/api/chat/send", authMiddleware, async (req: any, res) => {
    try {
        const { prompt, providerName = "OPENAI" } = req.body;
        const allowedProviders: AIProviderName[] = ["OPENAI", "GEMINI", "CLAUDE", "KIMI", "OPENROUTER"];

        if (typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({ error: "Prompt is required" });
        }
        if (typeof providerName !== "string" || !allowedProviders.includes(providerName as AIProviderName)) {
            return res.status(400).json({ error: "Unsupported provider", supportedProviders: allowedProviders });
        }

        const result = await sendChatMessage(req.user.id, prompt, providerName as AIProviderName);
        return res.status(200).json(result);
    } catch (error: any) {
        console.error("[CHAT] Request failed:", error);

        if (error.message === "UNSUPPORTED_PROVIDER") {
            return res.status(400).json({ error: "Unsupported provider" });
        }
        if (error.message.includes("not found or inactive")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("limit exceeded")) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.endsWith("_KEY_NOT_CONFIGURED")) {
            return res.status(503).json({ error: "The selected provider API key is not configured" });
        }
        if (error.message.endsWith("_MODEL_NOT_CONFIGURED")) {
            return res.status(503).json({ error: "The selected provider model is not configured" });
        }

        return res.status(502).json({ error: error.message || "AI provider request failed" });
    }
});

export default router;




