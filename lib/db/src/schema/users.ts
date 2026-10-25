import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  occasion: text("occasion"),
  tier: text("tier"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});