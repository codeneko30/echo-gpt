
import { Router } from "express";
import { getUserProfile } from "../../services/getProfile/getProfile.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts"; 

const router = Router();

router.get("/api/users/profile", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const profile = await getUserProfile(userId);
        return res.status(200).json(profile);
    } catch (error: any) {
        if (error.message === "User not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;