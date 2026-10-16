import { Router } from "express";
import { updateProvider } from "../../services/updateProvider/updateProvider.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";
import  roleMiddleware  from "../../middleware/roleMiddleware.ts";

const router = Router();

router.put("/api/providers/:id", authMiddleware, roleMiddleware(["ADMIN"]), async (req: any, res) => {
    try {
        const providerId = Number(req.params.id);
        const { apiKey, isActive } = req.body;

        if (isNaN(providerId)) {
            return res.status(400).json({ error: "Invalid provider ID" });
        }

        await updateProvider(providerId, apiKey, isActive);
        return res.status(200).json({ message: "Provider updated successfully" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;