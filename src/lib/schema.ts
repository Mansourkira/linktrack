import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  order: integer("order"),
});

export const clicks = pgTable("clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").references(() => links.id),
  clickedAt: timestamp("clicked_at").defaultNow(),
});
