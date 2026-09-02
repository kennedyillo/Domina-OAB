import { bigint, bigserial, boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pilotLeads = pgTable("pilot_leads", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("founder"),
  consentVersion: text("consent_version").notNull().default("2026-09"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  eventType: text("event_type").notNull(),
  path: text("path").notNull().default("/"),
  sessionId: text("session_id").notNull(),
  referrer: text("referrer").notNull().default(""),
  utmSource: text("utm_source").notNull().default(""),
  utmMedium: text("utm_medium").notNull().default(""),
  utmCampaign: text("utm_campaign").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("analytics_events_type_created_idx").on(table.eventType, table.createdAt),
  index("analytics_events_session_idx").on(table.sessionId),
]);

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  billingType: text("billing_type").notNull(),
  durationDays: integer("duration_days"),
  priceCents: integer("price_cents").notNull(),
  maxInstallments: integer("max_installments").notNull().default(1),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id"),
  email: text("email").notNull(),
  planId: text("plan_id").notNull().references(() => plans.id),
  provider: text("provider").notNull().default("mercado_pago"),
  providerSubscriptionId: text("provider_subscription_id").unique(),
  status: text("status").notNull().default("pending"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  nextChargeAt: timestamp("next_charge_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("subscriptions_user_status_idx").on(table.userId, table.status),
  index("subscriptions_email_idx").on(table.email),
]);

export const payments = pgTable("payments", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id"),
  email: text("email").notNull(),
  planId: text("plan_id").notNull().references(() => plans.id),
  subscriptionId: bigint("subscription_id", { mode: "number" }).references(() => subscriptions.id),
  provider: text("provider").notNull().default("mercado_pago"),
  providerPaymentId: text("provider_payment_id").unique(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  installments: integer("installments").notNull().default(1),
  grossAmountCents: integer("gross_amount_cents").notNull(),
  feeAmountCents: integer("fee_amount_cents").notNull().default(0),
  netAmountCents: integer("net_amount_cents").notNull().default(0),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  availableAt: timestamp("available_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("payments_status_created_idx").on(table.status, table.createdAt),
  index("payments_user_idx").on(table.userId),
]);

export const entitlements = pgTable("entitlements", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id"),
  email: text("email").notNull(),
  planId: text("plan_id").notNull().references(() => plans.id),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id"),
  status: text("status").notNull().default("pending"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("entitlements_user_status_idx").on(table.userId, table.status),
  index("entitlements_email_idx").on(table.email),
]);

export const paymentEvents = pgTable("payment_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  provider: text("provider").notNull().default("mercado_pago"),
  providerEventId: text("provider_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  resourceId: text("resource_id"),
  processingStatus: text("processing_status").notNull().default("received"),
  payload: text("payload").notNull(),
  errorMessage: text("error_message"),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
}, (table) => [
  index("payment_events_status_received_idx").on(table.processingStatus, table.receivedAt),
]);
