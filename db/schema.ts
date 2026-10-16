
import {
    pgTable,
    integer,
    text,
    timestamp,
    boolean,
    jsonb,
    index,
} from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),

});

export const users = pgTable("users", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name"),
    roleId: integer("role_id").references(() => roles.id, { onDelete: "restrict" }).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

}, (table) => [

    index("users_role_id_idx").on(table.roleId),

]);

export const sessions = pgTable("sessions", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),

}, (table) => [

    index("sessions_user_id_idx").on(table.userId),
    index("sessions_refresh_token_hash_idx").on(table.refreshTokenHash),
    index("sessions_expires_at_idx").on(table.expiresAt),

]);

export const subscriptions = pgTable("subscriptions", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
    planType: text("plan_type").notNull().default("FREE"),
    status: text("status").notNull().default("ACTIVE"),
    requestLimit: integer("request_limit").notNull().default(50),
    requestsUsed: integer("requests_used").notNull().default(0),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

});

export const aiProviders = pgTable("ai_providers", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    providerName: text("provider_name").notNull().unique(),
    apiKey: text("api_key").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

});

export const chatHistory = pgTable("chat_history", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    providerId: integer("provider_id").references(() => aiProviders.id, { onDelete: "set null" }),
    prompt: text("prompt").notNull(),
    response: text("response").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),

}, (table) => [

    index("chat_history_user_created_idx").on(table.userId, table.createdAt),

]);

export const webSearches = pgTable("web_searches", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    query: text("query").notNull(),
    results: jsonb("results"),
    createdAt: timestamp("created_at").defaultNow().notNull(),

}, (table) => [

    index("web_searches_user_created_idx").on(table.userId, table.createdAt),

]);

export const apiUsageLogs = pgTable("api_usage_logs", {

    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    endpoint: text("endpoint").notNull(),
    method: text("method").notNull(),
    statusCode: integer("status_code").notNull(),
    responseTimeMs: integer("response_time_ms"),
    createdAt: timestamp("created_at").defaultNow().notNull(),

}, (table) => [

    index("api_usage_logs_user_created_idx").on(table.userId, table.createdAt),
    index("api_usage_logs_created_at_idx").on(table.createdAt),

]);
