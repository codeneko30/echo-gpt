import { Router } from "express";
import { getSystemHealth } from "../../services/adminSystemHealth/adminSystemHealth.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";
import  roleMiddleware  from "../../middleware/roleMiddleware.ts";

const router = Router();

router.get("/api/admin/system-health", authMiddleware, roleMiddleware(["ADMIN"]), async (_req: any, res) => {
    try {
        const health = getSystemHealth();
        return res.status(200).json(health);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;