import { Router } from "express";
import { getSearchSuggestions } from "../../services/searchSuggestions/searchSuggestions.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.get("/api/search/suggestions", authMiddleware, async (_req: any, res) => {
    try {
        const result = getSearchSuggestions();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;