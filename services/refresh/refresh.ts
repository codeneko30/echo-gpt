import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { users, roles } from "../../db/schema.ts";

function generateAccessToken(user: any, roleName: string) {
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET || "access_secret";
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: roleName,
        },
        accessTokenSecret,
        { expiresIn: "15m" }
    );
}

export async function refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
        throw new Error("Refresh token required");
    }

    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "refresh_secret";
    let decoded: any;

    try {
        decoded = jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
        throw new Error("Invalid refresh token");
    }

    // ইউজার খুঁজে বের করা
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id));

    if (!user) {
        throw new Error("User not found");
    }

    // ইউজারের রোল বের করা
    const [userRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, user.roleId));

    if (!userRole) {
        throw new Error("User role not found");
    }

    // নতুন অ্যাক্সেস টোকেন জেনারেট করা
    const accessToken = generateAccessToken(user, userRole.name);

    return {
        accessToken,
    };
}