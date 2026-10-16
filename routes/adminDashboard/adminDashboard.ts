import { Router } from "express";
import { getAdminDashboardStats } from "../../services/adminDashboard/adminDashboard.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";
import  roleMiddleware  from "../../middleware/roleMiddleware.ts";

const router = Router();

router.get("/api/admin/dashboard/stats", authMiddleware, roleMiddleware(["ADMIN"]), async (_req: any, res) => {
    try {
        const stats = await getAdminDashboardStats();
        return res.status(200).json(stats);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;