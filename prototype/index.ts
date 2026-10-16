import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, sql, and } from "drizzle-orm";
import { db } from "../db/connection.ts";
import { users, roles, sessions, subscriptions, aiProviders, chatHistory, webSearches, apiUsageLogs } from "../db/schema.ts";
import authMiddleware from "../middleware/authMiddleware.ts";
import roleMiddleware from "../middleware/roleMiddleware.ts";

import { generateAIResponse, type AIProviderName } from "../providers/aiProvider.ts";




require("dotenv").config();

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 3000;

const generateTokens = (user, roleName) => {
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: roleName }, process.env.JWT_ACCESS_SECRET || "access_secret", { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

// ==================== 1. AUTH ROUTES (4 Endpoints) ====================
app.post("/api/auth/register", async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        const [userRole] = await db.select().from(roles).where(eq(roles.name, "USER"));
        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await db.insert(users).values({ email, passwordHash: hashedPassword, fullName, roleId: userRole.id }).returning();
        await db.insert(subscriptions).values({ userId: newUser.id, planType: "FREE", requestLimit: 50 });
        return res.status(201).json({ message: "Registered successfully", userId: newUser.id });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Invalid credentials" });

        const [userRole] = await db.select().from(roles).where(eq(roles.id, user.roleId));
        const { accessToken, refreshToken } = generateTokens(user, userRole.name);
        await db.insert(sessions).values({ userId: user.id, refreshTokenHash: await bcrypt.hash(refreshToken, 10), expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
        return res.status(200).json({ message: "Login successful", accessToken, refreshToken });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.post("/api/auth/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh_secret");
        const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
        const [userRole] = await db.select().from(roles).where(eq(roles.id, user.roleId));
        const { accessToken } = generateTokens(user, userRole.name);
        return res.status(200).json({ accessToken });
    } catch (error) { return res.status(403).json({ error: "Invalid refresh token" }); }
});

app.post("/api/auth/logout", authMiddleware, async (req, res) => {
    try {
        await db.delete(sessions).where(eq(sessions.userId, req.user.id));
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ==================== 2. USER ROUTES (4 Endpoints) ====================
app.get("/api/users/profile", authMiddleware, async (req, res) => {
    try {
        const [user] = await db.select({ id: users.id, email: users.email, fullName: users.fullName }).from(users).where(eq(users.id, req.user.id));
        return res.status(200).json(user);
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.put("/api/users/update-profile", authMiddleware, async (req, res) => {
    try {
        const { fullName } = req.body;
        await db.update(users).set({ fullName, updatedAt: new Date() }).where(eq(users.id, req.user.id));
        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.put("/api/users/change-password", authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
        if (!(await bcrypt.compare(oldPassword, user.passwordHash))) return res.status(400).json({ error: "Incorrect old password" });
        await db.update(users).set({ passwordHash: await bcrypt.hash(newPassword, 10) }).where(eq(users.id, req.user.id));
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.delete("/api/users/delete-account", authMiddleware, async (req, res) => {
    try {
        await db.delete(users).where(eq(users.id, req.user.id));
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ==================== 3. SUBSCRIPTION ROUTES (3 Endpoints) ====================
app.get("/api/subscriptions/status", authMiddleware, async (req, res) => {
    try {
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, req.user.id));
        return res.status(200).json(sub);
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.post("/api/subscriptions/upgrade", authMiddleware, async (req, res) => {
    try {
        const { planType } = req.body;
        await db.update(subscriptions).set({ planType, requestLimit: 1000, updatedAt: new Date() }).where(eq(subscriptions.userId, req.user.id));
        return res.status(200).json({ message: "Subscription upgraded successfully" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get("/api/subscriptions/remaining-requests", authMiddleware, async (req, res) => {
    try {
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, req.user.id));
        return res.status(200).json({ remaining: sub.requestLimit - sub.requestsUsed });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ==================== 4. AI PROVIDER ROUTES (5 Endpoints) ====================
app.get("/api/providers-get", authMiddleware, async (_req, res) => {
    try {
        const list = await db.select().from(aiProviders);
        return res.status(200).json(list);
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.post("/api/providers-post", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const { providerName, apiKey, isDefault, isActive } = req.body;
        const [p] = await db.insert(aiProviders).values({ providerName, apiKey, isDefault, isActive }).returning();
        return res.status(201).json({ message: "Provider added successfully", p });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.put("/api/providers/:id", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const { apiKey, isActive } = req.body;
        await db.update(aiProviders).set({ apiKey, isActive, updatedAt: new Date() }).where(eq(aiProviders.id, req.params.id));
        return res.status(200).json({ message: "Provider updated successfully" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.delete("/api/providers-delete/:id", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        await db.delete(aiProviders).where(eq(aiProviders.id, req.params.id));
        return res.status(200).json({ message: "Provider deleted successfully" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get("/api/providers/health", async (_req, res) => {
    try { return res.status(200).json({ status: "AI Providers Service is Healthy" }); } 
    catch (error) { return res.status(500).json({ error: error.message }); }
});

// ==================== 5. CHAT ROUTES (2 Endpoints) ====================



// app.post("/api/chat/send", authMiddleware, async (req, res) => {
//     try {
//         const { prompt, providerName } = req.body;
//         const [provider] = await db.select().from(aiProviders).where(eq(aiProviders.providerName, providerName || "OPENAI"));
//         const response = `EchoGPT Mock AI Response for: ${prompt}`;
//         await db.insert(chatHistory).values({ userId: req.user.id, providerId: provider?.id, prompt, response });
//         await db.execute(sql`UPDATE subscriptions SET requests_used = requests_used + 1 WHERE user_id = ${req.user.id}`);
//         return res.status(200).json({ prompt, response });
//     } catch (error) { return res.status(500).json({ error: error.message }); }
// });











app.post("/api/chat/send", authMiddleware, async (req, res) => {
    let usageReserved = false;

    try {
        const { prompt, providerName = "OPENAI" } = req.body;
        const allowedProviders: AIProviderName[] = ["OPENAI", "GEMINI", "CLAUDE", "KIMI", "OPENROUTER"];

        if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "Prompt is required" });
        if (typeof providerName !== "string" || !allowedProviders.includes(providerName as AIProviderName)) return res.status(400).json({ error: "Unsupported provider", supportedProviders: allowedProviders });

        console.log(`[CHAT] Step 1: Validating ${providerName}`);

        const [provider] = await db.select().from(aiProviders).where(and(eq(aiProviders.providerName, providerName), eq(aiProviders.isActive, true)));
        if (!provider) return res.status(404).json({ error: `${providerName} provider not found or inactive` });

        console.log("[CHAT] Step 2: Provider found");
        console.log("[CHAT] Step 3: Checking subscription usage");

        const usageResult = await db.execute(sql`UPDATE subscriptions SET requests_used = requests_used + 1 WHERE user_id = ${req.user.id} AND requests_used < request_limit RETURNING user_id`);
        const usageRows = Array.isArray(usageResult) ? usageResult : usageResult.rows ?? [];
        if (usageRows.length === 0) return res.status(403).json({ error: "Subscription not found or request limit exceeded" });

        usageReserved = true;
        console.log("[CHAT] Step 4: Subscription usage reserved");
        console.log(`[CHAT] Step 5: Calling ${providerName} API`);

        const result = await generateAIResponse(providerName as AIProviderName, prompt.trim());

        console.log("[CHAT] Step 6: AI response received");

        await db.insert(chatHistory).values({ userId: req.user.id, providerId: provider.id, prompt: prompt.trim(), response: result.response });

        console.log("[CHAT] Step 7: Chat history saved");

        return res.status(200).json({ prompt: prompt.trim(), response: result.response, provider: providerName, model: result.model });
    } catch (error) {
        console.error("[CHAT] Request failed:", error);

        if (usageReserved) {
            try {
                await db.execute(sql`UPDATE subscriptions SET requests_used = GREATEST(requests_used - 1, 0) WHERE user_id = ${req.user.id}`);
                console.log("[CHAT] Subscription usage rolled back");
            } catch (rollbackError) {
                console.error("[CHAT] Usage rollback failed:", rollbackError);
            }
        }

        if (error instanceof Error) {
            if (error.message.endsWith("_KEY_NOT_CONFIGURED")) return res.status(503).json({ error: "The selected provider API key is not configured" });
            if (error.message.endsWith("_MODEL_NOT_CONFIGURED")) return res.status(503).json({ error: "The selected provider model is not configured" });
            if (error.message === "UNSUPPORTED_PROVIDER") return res.status(400).json({ error: "Unsupported provider" });
        }

        const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: unknown }).status) : 0;

        if (status === 429) return res.status(429).json({ error: "AI provider rate limit or quota exceeded" });
        if (status === 401 || status === 403) return res.status(502).json({ error: "AI provider authentication failed" });

        return res.status(502).json({ error: "AI provider request failed" });
    }
});






app.get("/api/chat/history", authMiddleware, async (req, res) => {
    try {
        const history = await db.select().from(chatHistory).where(eq(chatHistory.userId, req.user.id));
        return res.status(200).json(history);
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ==================== 6. WEB SEARCH ROUTES (3 Endpoints) ====================
app.post("/api/search", authMiddleware, async (req, res) => {
    try {
        const { query } = req.body;
        const results = [{ title: `Search result for ${query}`, snippet: "Sample snippet." }];
        await db.insert(webSearches).values({ userId: req.user.id, query, results });
        return res.status(200).json({ query, results });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get("/api/search/history", authMiddleware, async (req, res) => {
    try {
        const history = await db.select().from(webSearches).where(eq(webSearches.userId, req.user.id));
        return res.status(200).json(history);
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get("/api/search/suggestions", authMiddleware, async (_req, res) => {
    try {
        return res.status(200).json({ suggestions: ["EchoGPT extension features", "NestJS vs Express", "Drizzle ORM postgres"] });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ==================== 7. ADMIN PANEL ROUTES (4 Endpoints) ====================
app.get("/api/admin/dashboard/stats", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const [usersCount] = await db.select({ count: sql`count(*)` }).from(users);
        const [chatsCount] = await db.select({ count: sql`count(*)` }).from(chatHistory);
        return res.status(200).json({ totalUsers: usersCount.count, totalChats: chatsCount.count, status: "OK" });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get("/api/admin/users", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const allUsers = await db.select().from(users);
        return res.status(200).json(allUsers);
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get("/api/admin/logs", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const logs = await db.select().from(apiUsageLogs).limit(50);
        return res.status(200).json(logs);
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get("/api/admin/system-health", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        return res.status(200).json({ system: "Healthy", uptime: process.uptime(), memory: process.memoryUsage() });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.listen(PORT, () => console.log(`EchoGPT Server running on port ${PORT}`));















