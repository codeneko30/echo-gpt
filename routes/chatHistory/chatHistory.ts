import { Router } from "express";
import { getUserChatHistory } from "../../services/chatHistory/chatHistory.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";

const router = Router();

router.get("/api/chat/history", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const history = await getUserChatHistory(userId);
        return res.status(200).json(history);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;