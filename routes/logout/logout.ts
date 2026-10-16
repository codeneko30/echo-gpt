import { Router } from "express";

import authMiddleware from "../../middleware/authMiddleware.ts";
import { logoutUser } from "../../services/logout/logout.ts";

const router = Router();

router.post(
    "/api/auth/logout",
    authMiddleware,
    async (req, res) => {
        try {
            await logoutUser(req.user.id);

            return res.status(200).json({
                message: "Logged out successfully"
            });
        } catch (error) {
            return res.status(500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error"
            });
        }
    }
);

export default router;