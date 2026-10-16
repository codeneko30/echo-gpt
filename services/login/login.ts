// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { eq } from "drizzle-orm";

// import { db } from "../../db/connection.ts";
// import {
//     users,
//     roles,
//     sessions
// } from "../../db/schema.ts";

// function generateTokens(user: any, roleName: string) {
//     const accessToken = jwt.sign(
//         {
//             id: user.id,
//             email: user.email,
//             role: roleName
//         },
//         process.env.JWT_ACCESS_SECRET || "access_secret",
//         {
//             expiresIn: "15m"
//         }
//     );

//     const refreshToken = jwt.sign(
//         {
//             id: user.id
//         },
//         process.env.JWT_REFRESH_SECRET || "refresh_secret",
//         {
//             expiresIn: "7d"
//         }
//     );

//     return {
//         accessToken,
//         refreshToken
//     };
// }

// export async function loginUser(
//     email: string,
//     password: string
// ) {
//     const [user] = await db
//         .select()
//         .from(users)
//         .where(eq(users.email, email));

//     if (
//         !user ||
//         !(await bcrypt.compare(password, user.passwordHash))
//     ) {
//         throw new Error("Invalid credentials");
//     }

//     const [userRole] = await db
//         .select()
//         .from(roles)
//         .where(eq(roles.id, user.roleId));

//     const { accessToken, refreshToken } =
//         generateTokens(user, userRole.name);

//     await db
//         .insert(sessions)
//         .values({
//             userId: user.id,
//             refreshTokenHash: await bcrypt.hash(
//                 refreshToken,
//                 10
//             ),
//             expiresAt: new Date(
//                 Date.now() + 7 * 24 * 60 * 60 * 1000
//             )
//         });

//     return {
//         accessToken,
//         refreshToken
//     };
// }










import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../../db/connection.ts";
import {
    users,
    roles,
    sessions
} from "../../db/schema.ts";

function generateTokens(user: any, roleName: string) {
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: roleName
        },
        process.env.JWT_ACCESS_SECRET || "access_secret",
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = jwt.sign(
        {
            id: user.id
        },
        process.env.JWT_REFRESH_SECRET || "refresh_secret",
        {
            expiresIn: "7d"
        }
    );

    return {
        accessToken,
        refreshToken
    };
}

export async function loginUser(
    email: string,
    password: string
) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    if (
        !user ||
        !(await bcrypt.compare(password, user.passwordHash))
    ) {
        throw new Error("Invalid credentials");
    }

    const [userRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, user.roleId));

    // এই চেকটি যুক্ত করা হয়েছে যাতে userRole না থাকলে সঠিক এরর দেয়
    if (!userRole) {
        throw new Error("User role not found");
    }

    const { accessToken, refreshToken } =
        generateTokens(user, userRole.name);

    await db
        .insert(sessions)
        .values({
            userId: user.id,
            refreshTokenHash: await bcrypt.hash(
                refreshToken,
                10
            ),
            // মাইনাসের পরিবর্তে সঠিক গুণ (*) চিহ্ন দেওয়া হয়েছে
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        });

    return {
        accessToken,
        refreshToken
    };
}