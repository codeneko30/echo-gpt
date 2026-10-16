import { Router } from "express";
import { createProvider } from "../../services/createProvider/createProvider.ts";
import  authMiddleware  from "../../middleware/authMiddleware.ts";
import roleMiddleware  from "../../middleware/roleMiddleware.ts";

const router = Router();

router.post("/api/providers-post", authMiddleware, roleMiddleware(["ADMIN"]), async (req: any, res) => {
    try {
        const { providerName, apiKey, isDefault, isActive } = req.body;

        if (!providerName || !apiKey) {
            return res.status(400).json({ error: "providerName and apiKey are required" });
        }

        const p = await createProvider(providerName, apiKey, isDefault, isActive);
        return res.status(201).json({ message: "Provider added successfully", p });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;