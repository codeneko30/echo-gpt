import { Router } from "express";
import { performWebSearch } from "../../services/search/search.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.post("/api/search", authMiddleware, async (req: any, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== "string" || !query.trim()) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const result = await performWebSearch(req.user.id, query);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;