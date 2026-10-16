import { Router } from "express";
import { getAllProviders } from "../../services/getProviders/getProviders.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.get("/api/providers-get", authMiddleware, async (_req: any, res) => {
    try {
        const list = await getAllProviders();
        return res.status(200).json(list);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;