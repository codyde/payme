import { pgTable, text, timestamp, varchar, serial, decimal, integer } from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  username: text("username").notNull(),
  name: text("name"),
  email: varchar("email", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date"
  }).notNull()
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(), // Using nanoid
  name: text('name').notNull(),
  description: text('description').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  billablePerson: text('billable_person').notNull(),
  status: text('status').default('unpaid').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  business: text("business").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  invoiceId: text("invoice_id").references(() => invoices.id),
  userId: text("user_id").notNull().references(() => users.id),
  status: text("status").default("pending").notNull(),
  notes: text("notes"), // Add this line
});

export interface DatabaseUser {
  id: string;
  githubId: string;
  username: string;
}

export type Invoice = typeof invoices.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export interface TransactionListProps {
  userId: string;
  invoiceId?: string;
  initialTransactions: Transaction[];
}