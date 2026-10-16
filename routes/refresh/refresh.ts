import { Router } from "express";
import { refreshAccessToken } from "../../services/refresh/refresh.ts";

const router = Router();

router.post("/api/auth/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await refreshAccessToken(refreshToken);
        return res.status(200).json(result);
    } catch (error: any) {
        const message = error.message || "Invalid refresh token";
        const status = message === "Refresh token required" ? 401 : 403;
        return res.status(status).json({ error: message });
    }
});

export default router;