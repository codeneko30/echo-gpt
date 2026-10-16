import { Router } from "express";
import { getAllUsersForAdmin } from "../../services/adminUsers/adminUsers.ts";
import  authMiddleware from "../../middleware/authMiddleware.ts";
import  roleMiddleware  from "../../middleware/roleMiddleware.ts";

const router = Router();

router.get("/api/admin/users", authMiddleware, roleMiddleware(["ADMIN"]), async (_req: any, res) => {
    try {
        const allUsers = await getAllUsersForAdmin();
        return res.status(200).json(allUsers);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;