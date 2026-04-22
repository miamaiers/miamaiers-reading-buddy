import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const readingBuddyBooksTable = pgTable("reading_buddy_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  totalPages: integer("total_pages").notNull(),
  currentPage: integer("current_page").notNull().default(0),
  status: text("status").notNull().default("currently_reading"),
  startedAt: date("started_at").notNull().defaultNow(),
  completedAt: date("completed_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const readingBuddySessionsTable = pgTable("reading_buddy_sessions", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id")
    .notNull()
    .references(() => readingBuddyBooksTable.id),
  pagesRead: integer("pages_read").notNull(),
  minutesRead: integer("minutes_read"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const readingBuddySettingsTable = pgTable("reading_buddy_settings", {
  id: serial("id").primaryKey(),
  dailyGoalPages: integer("daily_goal_pages").notNull().default(25),
  reminderTime: text("reminder_time").notNull().default("8:00 PM"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertReadingBuddyBookSchema = createInsertSchema(
  readingBuddyBooksTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReadingBuddySessionSchema = createInsertSchema(
  readingBuddySessionsTable,
).omit({
  id: true,
  createdAt: true,
});

export const insertReadingBuddySettingsSchema = createInsertSchema(
  readingBuddySettingsTable,
).omit({
  id: true,
  updatedAt: true,
});

export type InsertReadingBuddyBook = z.infer<
  typeof insertReadingBuddyBookSchema
>;
export type ReadingBuddyBook = typeof readingBuddyBooksTable.$inferSelect;
export type InsertReadingBuddySession = z.infer<
  typeof insertReadingBuddySessionSchema
>;
export type ReadingBuddySession = typeof readingBuddySessionsTable.$inferSelect;
export type InsertReadingBuddySettings = z.infer<
  typeof insertReadingBuddySettingsSchema
>;
export type ReadingBuddySettings = typeof readingBuddySettingsTable.$inferSelect;