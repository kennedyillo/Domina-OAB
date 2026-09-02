import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pilotLeads = sqliteTable("pilot_leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  status: text("status", { enum: ["founder"] }).notNull(),
  consentVersion: text("consent_version").notNull().default("2026-08"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const analyticsEvents = sqliteTable("analytics_events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventType: text("event_type").notNull(),
    path: text("path").notNull().default("/"),
    sessionId: text("session_id").notNull(),
    referrer: text("referrer").notNull().default(""),
    utmSource: text("utm_source").notNull().default(""),
    utmMedium: text("utm_medium").notNull().default(""),
    utmCampaign: text("utm_campaign").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("analytics_events_type_created_idx").on(table.eventType, table.createdAt),
    index("analytics_events_session_idx").on(table.sessionId),
  ],
);

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  billingType: text("billing_type", { enum: ["recurring", "one_time", "promotional"] }).notNull(),
  durationDays: integer("duration_days"),
  priceCents: integer("price_cents").notNull(),
  maxInstallments: integer("max_installments").notNull().default(1),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  email: text("email").notNull(),
  planId: text("plan_id").notNull().references(() => plans.id),
  provider: text("provider", { enum: ["mercado_pago", "internal"] }).notNull().default("mercado_pago"),
  providerSubscriptionId: text("provider_subscription_id").unique(),
  status: text("status", { enum: ["pending", "authorized", "active", "paused", "past_due", "cancelled", "expired"] }).notNull().default("pending"),
  startsAt: text("starts_at"),
  currentPeriodEnd: text("current_period_end"),
  nextChargeAt: text("next_charge_at"),
  cancelledAt: text("cancelled_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("subscriptions_user_status_idx").on(table.userId, table.status),
  index("subscriptions_email_idx").on(table.email),
]);

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  email: text("email").notNull(),
  planId: text("plan_id").notNull().references(() => plans.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  provider: text("provider", { enum: ["mercado_pago", "internal"] }).notNull().default("mercado_pago"),
  providerPaymentId: text("provider_payment_id").unique(),
  status: text("status", { enum: ["pending", "approved", "rejected", "cancelled", "refunded", "charged_back"] }).notNull().default("pending"),
  paymentMethod: text("payment_method"),
  installments: integer("installments").notNull().default(1),
  grossAmountCents: integer("gross_amount_cents").notNull(),
  feeAmountCents: integer("fee_amount_cents").notNull().default(0),
  netAmountCents: integer("net_amount_cents").notNull().default(0),
  approvedAt: text("approved_at"),
  availableAt: text("available_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("payments_status_created_idx").on(table.status, table.createdAt),
  index("payments_user_idx").on(table.userId),
]);

export const entitlements = sqliteTable("entitlements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  email: text("email").notNull(),
  planId: text("plan_id").notNull().references(() => plans.id),
  sourceType: text("source_type", { enum: ["payment", "subscription", "founder", "manual"] }).notNull(),
  sourceId: text("source_id"),
  status: text("status", { enum: ["pending", "active", "suspended", "expired", "revoked"] }).notNull().default("pending"),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("entitlements_user_status_idx").on(table.userId, table.status),
  index("entitlements_email_idx").on(table.email),
]);

export const paymentEvents = sqliteTable("payment_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  provider: text("provider", { enum: ["mercado_pago"] }).notNull().default("mercado_pago"),
  providerEventId: text("provider_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  resourceId: text("resource_id"),
  processingStatus: text("processing_status", { enum: ["received", "processed", "ignored", "failed"] }).notNull().default("received"),
  payload: text("payload").notNull(),
  errorMessage: text("error_message"),
  receivedAt: text("received_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  processedAt: text("processed_at"),
}, (table) => [
  index("payment_events_status_received_idx").on(table.processingStatus, table.receivedAt),
]);
