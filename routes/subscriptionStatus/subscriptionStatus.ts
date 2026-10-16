import { Router } from "express";
import { getUserSubscriptionStatus } from "../../services/subscriptionStatus/subscriptionStatus.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.get("/api/subscriptions/status", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const subscription = await getUserSubscriptionStatus(userId);
        return res.status(200).json(subscription);
    } catch (error: any) {
        if (error.message === "Subscription not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;