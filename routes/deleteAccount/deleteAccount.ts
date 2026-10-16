import { Router } from "express";
import { deleteUserAccount } from "../../services/deleteAccount/deleteAccount.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.delete("/api/users/account", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const result = await deleteUserAccount(userId);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "User ID is required") {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;