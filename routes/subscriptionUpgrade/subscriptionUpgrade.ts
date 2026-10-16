import { Router } from "express";
import { upgradeUserSubscription } from "../../services/subscriptionUpgrade/subscriptionUpgrade.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.post("/api/subscriptions/upgrade", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { planType } = req.body;

        if (!planType) {
            return res.status(400).json({ error: "Plan type is required" });
        }

        const result = await upgradeUserSubscription(userId, planType);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;