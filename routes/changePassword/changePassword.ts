import { Router } from "express";
import { changeUserPassword } from "../../services/changePassword/changePassword.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.put("/api/users/change-password", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const result = await changeUserPassword(userId, oldPassword, newPassword);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "Incorrect old password" || error.message === "Old password and new password are required") {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === "User not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;