import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  members: text("members").array().notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("waiting"), // waiting, in-progress, completed
  assignedStaff: text("assigned_staff"),
  notes: text("notes").default(""),
  present: boolean("present").default(false),
  registrationTime: timestamp("registration_time").defaultNow(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  queuePosition: integer("queue_position").notNull(),
  activityDuration: integer("activity_duration").default(10),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  registrationTime: true,
  queuePosition: true,
  size: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;
