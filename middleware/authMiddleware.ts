
import jwt from "jsonwebtoken";

// Basic function-based middleware pattern

export default function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ error: "Access token missing" });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(403).json({
            error: "Invalid or expired access token"
        });

    }

}