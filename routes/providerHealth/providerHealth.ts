import { Router } from "express";
import { checkProviderHealth } from "../../services/providerHealth/providerHealth.ts";

const router = Router();

router.get("/api/providers/health", async (_req, res) => {
    try {
        const result = checkProviderHealth();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;