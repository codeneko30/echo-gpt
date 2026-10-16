import { Router } from "express";
import { deleteProvider } from "../../services/deleteProvider/deleteProvider.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";
import  roleMiddleware  from "../../middleware/roleMiddleware.ts";

const router = Router();

router.delete("/api/providers-delete/:id", authMiddleware, roleMiddleware(["ADMIN"]), async (req: any, res) => {
    try {
        const providerId = Number(req.params.id);

        if (isNaN(providerId)) {
            return res.status(400).json({ error: "Invalid provider ID" });
        }

        await deleteProvider(providerId);
        return res.status(200).json({ message: "Provider deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;