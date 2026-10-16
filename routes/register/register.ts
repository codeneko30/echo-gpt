
import { Router } from "express";

import { registerUser } from "../../services/register/register.ts";

const router = Router();

router.post("/api/auth/register", async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        const newUser = await registerUser(
            email,
            password,
            fullName
        );

        return res.status(201).json({
            message: "Registered successfully",
            userId: newUser.id
        });
    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
});

export default router;