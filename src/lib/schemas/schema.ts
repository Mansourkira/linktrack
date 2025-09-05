// src/lib/schema.ts
import {
  pgTable, uuid, text, varchar, timestamp, integer, boolean, jsonb,
  pgEnum, numeric, date, index, uniqueIndex
} from "drizzle-orm/pg-core"

// ---------- Enums ----------
export const memberRole = pgEnum("member_role", ["owner", "admin", "editor", "viewer"])
export const dnsStatus = pgEnum("dns_status", ["unverified", "pending", "verified", "failed"])
export const ruleType = pgEnum("rule_type", [
  "country", "device", "os", "browser", "language", "referrer", "query", "time"
])
export const planType = pgEnum("plan_type", ["free", "pro", "business"])
export const subStatus = pgEnum("sub_status", ["trialing", "active", "past_due", "canceled"])

// ---------- Identities / Teams ----------
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 64 }).unique(), // Temporarily nullable for quick fix
  email: text("email"),
  fullName: varchar("full_name", { length: 160 }),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  themeMode: varchar("theme_mode", { length: 10 }).default("system"), // system|light|dark
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("profiles_username_idx").on(table.username),
  emailIdx: index("profiles_email_idx").on(table.email),
}))

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerProfileId: uuid("owner_profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(), // e.g. acme
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("workspaces_slug_idx").on(table.slug),
  ownerIdx: index("workspaces_owner_idx").on(table.ownerProfileId),
}))

export const workspaceMembers = pgTable("workspace_members", {
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  role: memberRole("role").default("viewer").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  pk: { primaryKey: [table.workspaceId, table.profileId] },
  workspaceIdx: index("workspace_members_workspace_idx").on(table.workspaceId),
  profileIdx: index("workspace_members_profile_idx").on(table.profileId),
}))

// ---------- Custom Domains ----------
export const domains = pgTable("domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  domain: varchar("domain", { length: 255 }).notNull().unique(),       // e.g. go.acme.com
  status: dnsStatus("status").default("unverified").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  domainIdx: index("domains_domain_idx").on(table.domain),
  workspaceIdx: index("domains_workspace_idx").on(table.workspaceId),
  statusIdx: index("domains_status_idx").on(table.status),
}))

// ---------- Core: Links ----------
export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Profile ID for ownership
  ownerProfileId: uuid("ownerProfileId").notNull().references(() => profiles.id, { onDelete: "cascade" }),

  // short code/slug for the link
  shortCode: varchar("shortCode", { length: 128 }).notNull(),

  // destination URL
  originalUrl: text("originalUrl").notNull(),

  // optional access controls / limits
  isPasswordProtected: boolean("isPasswordProtected").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  clickCount: integer("clickCount").default(0).notNull(),

  // timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),

}, (table) => ({
  // Unique constraint: shortCode must be unique
  shortCodeIdx: uniqueIndex("links_shortcode_unique").on(table.shortCode),
  ownerProfileIdx: index("links_owner_profile_idx").on(table.ownerProfileId),
  activeIdx: index("links_active_idx").on(table.isActive),
  createdIdx: index("links_created_idx").on(table.createdAt),
  deletedAtIdx: index("links_deleted_at_idx").on(table.deletedAt),
}))

export const linkUtmDefaults = pgTable("link_utm_defaults", {
  linkId: uuid("link_id").primaryKey().references(() => links.id, { onDelete: "cascade" }),
  utmSource: varchar("utm_source", { length: 80 }),
  utmMedium: varchar("utm_medium", { length: 80 }),
  utmCampaign: varchar("utm_campaign", { length: 120 }),
  utmTerm: varchar("utm_term", { length: 120 }),
  utmContent: varchar("utm_content", { length: 120 }),
})

// ---------- Smart Routing / Rules (geo/device/time, etc.) ----------
export const linkRules = pgTable("link_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  type: ruleType("type").notNull(),
  // The "match" value depends on type (e.g., "US", "mobile", "iOS", "Chrome", "fr", "twitter.com")
  match: varchar("match", { length: 120 }).notNull(),
  // Where to redirect if this rule matches
  toUrl: text("to_url").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  linkIdx: index("link_rules_link_idx").on(table.linkId),
  typeIdx: index("link_rules_type_idx").on(table.type),
  orderIdx: index("link_rules_order_idx").on(table.order),
}))

// ---------- Analytics ----------
export const clicks = pgTable("clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  domainId: uuid("domain_id").references(() => domains.id, { onDelete: "set null" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),

  clickedAt: timestamp("clicked_at").defaultNow().notNull(),

  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),

  country: varchar("country", { length: 2 }),
  region: varchar("region", { length: 80 }),
  city: varchar("city", { length: 120 }),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),

  deviceType: varchar("device_type", { length: 16 }), // mobile/desktop/tablet/other
  os: varchar("os", { length: 64 }),
  browser: varchar("browser", { length: 64 }),
  language: varchar("language", { length: 16 }),

  utmSource: varchar("utm_source", { length: 80 }),
  utmMedium: varchar("utm_medium", { length: 80 }),
  utmCampaign: varchar("utm_campaign", { length: 120 }),
  utmTerm: varchar("utm_term", { length: 120 }),
  utmContent: varchar("utm_content", { length: 120 }),

  meta: jsonb("meta"), // any additional kv pairs
}, (table) => ({
  linkIdx: index("clicks_link_idx").on(table.linkId),
  clickedAtIdx: index("clicks_clicked_at_idx").on(table.clickedAt),
  domainIdx: index("clicks_domain_idx").on(table.domainId),
  workspaceIdx: index("clicks_workspace_idx").on(table.workspaceId),
  profileIdx: index("clicks_profile_idx").on(table.profileId),
  countryIdx: index("clicks_country_idx").on(table.country),
  deviceTypeIdx: index("clicks_device_type_idx").on(table.deviceType),
  osIdx: index("clicks_os_idx").on(table.os),
  browserIdx: index("clicks_browser_idx").on(table.browser),
  // Composite index for common queries
  linkClickedIdx: index("clicks_link_clicked_idx").on(table.linkId, table.clickedAt),
}))

export const clickDaily = pgTable("click_daily", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  day: date("day").notNull(),                 // YYYY-MM-DD
  count: integer("count").default(0).notNull()
}, (table) => ({
  linkIdx: index("click_daily_link_idx").on(table.linkId),
  dayIdx: index("click_daily_day_idx").on(table.day),
  // Composite index for common queries
  linkDayIdx: uniqueIndex("click_daily_link_day_unique").on(table.linkId, table.day),
}))

// ---------- Billing (optional, simple) ----------
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: planType("code").notNull().unique(),
  priceMonthly: numeric("price_monthly", { precision: 10, scale: 2 }).default("0").notNull(),
  maxLinks: integer("max_links").default(50).notNull(),
  maxCustomDomains: integer("max_custom_domains").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  codeIdx: index("plans_code_idx").on(table.code),
}))

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  plan: planType("plan").notNull(),
  status: subStatus("status").default("active").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index("subscriptions_workspace_idx").on(table.workspaceId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
  planIdx: index("subscriptions_plan_idx").on(table.plan),
}))

// ---------- API Keys / Webhooks (optional) ----------
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  hashedKey: text("hashed_key").notNull(), // store a hash, not the raw key
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
}, (table) => ({
  workspaceIdx: index("api_keys_workspace_idx").on(table.workspaceId),
  hashedKeyIdx: index("api_keys_hashed_key_idx").on(table.hashedKey),
}))

export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: text("secret"),
  eventTypes: jsonb("event_types"), // ["click.created", "link.created", ...]
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index("webhooks_workspace_idx").on(table.workspaceId),
  eventTypesIdx: index("webhooks_event_types_idx").on(table.eventTypes),
}))

// ---------- Password Protected Links (for your password feature) ----------
export const linkPasswords = pgTable("link_passwords", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(), // bcrypt hash of the password
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  linkIdx: index("link_passwords_link_idx").on(table.linkId),
  isActiveIdx: index("link_passwords_active_idx").on(table.isActive),
}))

// ---------- Link Access Logs (for password attempts, etc.) ----------
export const linkAccessLogs = pgTable("link_access_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  accessType: varchar("access_type", { length: 20 }).notNull(), // "success", "password_required", "password_failed", "expired", "max_clicks_reached"
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
  meta: jsonb("meta"), // additional context
}, (table) => ({
  linkIdx: index("link_access_logs_link_idx").on(table.linkId),
  accessTypeIdx: index("link_access_logs_type_idx").on(table.accessType),
  attemptedAtIdx: index("link_access_logs_attempted_idx").on(table.attemptedAt),
  // Composite index for common queries
  linkTypeIdx: index("link_access_logs_link_type_idx").on(table.linkId, table.accessType),
}))
