import { Router } from "express";

import { loginUser } from "../../services/login/login.ts";

const router = Router();

router.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const tokens = await loginUser(
            email,
            password
        );

        return res.status(200).json({
            message: "Login successful",
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Invalid credentials"
        ) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Internal server error"
        });
    }
});

export default router;