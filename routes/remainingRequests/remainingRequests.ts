import { Router } from "express";
import { getRemainingRequests } from "../../services/remainingRequests/remainingRequests.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.get("/api/subscriptions/remaining-requests", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const result = await getRemainingRequests(userId);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "Subscription not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;