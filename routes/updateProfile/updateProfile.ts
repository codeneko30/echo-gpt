import { Router } from "express";
import { updateUserProfile } from "../../services/updateProfile/updateProfile.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.put("/api/users/update-profile", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { fullName } = req.body;

        const result = await updateUserProfile(userId, fullName);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "Full name is required" || error.message === "User ID is required") {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;