import { Router } from "express";
import { getAdminApiLogs } from "../../services/adminLogs/adminLogs.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";
import  roleMiddleware  from "../../middleware/roleMiddleware.ts";

const router = Router();

router.get("/api/admin/logs", authMiddleware, roleMiddleware(["ADMIN"]), async (_req: any, res) => {
    try {
        const logs = await getAdminApiLogs();
        return res.status(200).json(logs);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;